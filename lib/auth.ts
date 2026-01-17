import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { createClient } from '@supabase/supabase-js';
import { verifyPassword, validateEmail } from './auth-utils';

// Validacao das variaveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
}

// Log de configuracao critica
console.log('[AUTH CONFIG] NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('[AUTH CONFIG] VERCEL_URL:', process.env.VERCEL_URL);
console.log('[AUTH CONFIG] NEXTAUTH_SECRET present:', !!process.env.NEXTAUTH_SECRET);
console.log('[AUTH CONFIG] NODE_ENV:', process.env.NODE_ENV);

// Se estiver no Vercel e NEXTAUTH_URL nao estiver setado, use VERCEL_URL
if (process.env.VERCEL_URL && !process.env.NEXTAUTH_URL) {
  console.warn('[AUTH CONFIG] NEXTAUTH_URL nao definido, usando VERCEL_URL');
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

// Cliente Supabase para consultas diretas
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const authOptions: NextAuthOptions = {
  // Providers de autenticacao
  providers: [
    // Google OAuth (método primário)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // Permite auto-linking de contas
    }),

    // Login com email e senha (método secundário)
    CredentialsProvider({
      id: 'credentials',
      name: 'Email e Senha',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'seu@email.com',
        },
        password: {
          label: 'Senha',
          type: 'password',
        },
      },
      async authorize(credentials) {
        console.log('[AUTH] authorize called for:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha sao obrigatorios');
        }

        // Valida formato do email
        if (!validateEmail(credentials.email)) {
          throw new Error('Email invalido');
        }

        try {
          // Busca usuario no Supabase
          const { data: user, error } = await supabase
            .from('users')
            .select('id, email, name, image, password, email_verified')
            .eq('email', credentials.email.toLowerCase())
            .single();

          if (error || !user) {
            console.error('[AUTH] Usuario nao encontrado:', credentials.email);
            throw new Error('Email ou senha incorretos');
          }

          console.log('[AUTH] Usuario encontrado:', { id: user.id, email: user.email, emailVerified: !!user.email_verified });

          // Verifica se o email foi verificado
          if (!user.email_verified) {
            console.error('[AUTH] Email nao verificado:', user.email);
            throw new Error(
              'Email nao verificado. Verifique sua caixa de entrada.'
            );
          }

          // Verifica senha
          if (!user.password) {
            console.error('[AUTH] Usuario sem senha (OAuth):', user.email);
            throw new Error(
              'Usuario criado via OAuth. Use login social ou redefina sua senha.'
            );
          }

          const isPasswordValid = await verifyPassword(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.error('[AUTH] Senha invalida para:', user.email);
            throw new Error('Email ou senha incorretos');
          }

          console.log('[AUTH] Autenticacao bem-sucedida para:', user.email);

          // Retorna usuario (sem o campo password)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: user.email_verified
              ? new Date(user.email_verified)
              : null,
          };
        } catch (error) {
          if (error instanceof Error) {
            console.error('[AUTH] Erro na autenticacao:', error.message);
            throw error;
          }
          throw new Error('Erro ao fazer login');
        }
      },
    }),
  ],

  // Configuracao de sessoes
  session: {
    strategy: 'jwt', // Usa JWT tokens (sem necessidade de adapter)
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  // Configuracao de cookies
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  // Paginas customizadas
  pages: {
    signIn: '/login',
    error: '/login', // Erros redirecionam para login
    verifyRequest: '/login', // Email de verificacao enviado
  },

  // Callbacks para customizar comportamento
  callbacks: {
    // Callback JWT: adiciona dados do usuario ao token JWT
    async jwt({ token, user }) {
      // Primeiro login: adiciona dados do usuario ao token
      if (user) {
        console.log('[AUTH] JWT callback - primeiro login:', user.email);
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.emailVerified = user.emailVerified;
      }

      return token;
    },

    // Callback Session: expoe dados do token para o cliente
    async session({ session, token }) {
      console.log('[AUTH] Session callback - token:', { email: token?.email, id: token?.id });
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },

    // Callback SignIn: cria/atualiza usuario no banco e controla acesso
    async signIn({ user, account, profile }) {
      console.log('[AUTH] signIn callback:', {
        provider: account?.provider,
        email: user.email
      });

      // Para Google OAuth: criar ou atualizar usuario no banco
      if (account?.provider === 'google') {
        // Verifica se email está verificado pelo Google
        const emailVerified = (profile as any)?.email_verified || (profile as any)?.verified_email;

        if (!emailVerified) {
          console.error('[AUTH] Email não verificado pelo Google:', user.email);
          return false; // Bloqueia login
        }

        try {
          // Verifica se usuario ja existe
          const { data: existingUser } = await supabase
            .from('users')
            .select('id, email, name, image')
            .eq('email', user.email)
            .single();

          if (existingUser) {
            // Usuario existe: atualiza dados e marca email como verificado
            console.log('[AUTH] Usuario Google existente, atualizando:', user.email);

            const { error: updateError } = await supabase
              .from('users')
              .update({
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                email_verified: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('email', user.email);

            if (updateError) {
              console.error('[AUTH] Erro ao atualizar usuario Google:', updateError);
              return false;
            }

            // Atualiza o user.id para o ID do banco
            user.id = existingUser.id;
            console.log('[AUTH] Usuario Google atualizado com sucesso:', user.email);
          } else {
            // Usuario novo: cria no banco
            console.log('[AUTH] Criando novo usuario Google:', user.email);

            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert({
                email: user.email,
                name: user.name,
                image: user.image,
                email_verified: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select('id')
              .single();

            if (insertError || !newUser) {
              console.error('[AUTH] Erro ao criar usuario Google:', insertError);
              return false;
            }

            // Atualiza o user.id para o ID do banco
            user.id = newUser.id;
            console.log('[AUTH] Usuario Google criado com sucesso:', user.email, 'ID:', newUser.id);
          }

          // Define emailVerified para o objeto user
          user.emailVerified = new Date();
        } catch (error) {
          console.error('[AUTH] Erro ao processar usuario Google:', error);
          return false;
        }
      }

      return true; // Permite login
    },

    // Callback Redirect: controla redirecionamentos apos login/logout
    async redirect({ url, baseUrl }) {
      // Redireciona para /app apos login bem-sucedido
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/app`;
      }

      // Permite redirecionamentos relativos
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      // Permite redirecionamentos para o mesmo host
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return baseUrl;
    },
  },

  // Eventos (opcional: para logs, analytics, etc)
  events: {
    async signIn({ user }) {
      console.log(`Usuario fez login: ${user.email}`);
    },
    async signOut({ token }) {
      console.log(`Usuario fez logout: ${token?.email}`);
    },
  },

  // Debug mode (desabilitar em producao)
  debug: process.env.NODE_ENV === 'development',

  // Secret para assinar tokens JWT
  secret: process.env.NEXTAUTH_SECRET,
};

// Exporta handler default para NextAuth v4
export default NextAuth(authOptions);

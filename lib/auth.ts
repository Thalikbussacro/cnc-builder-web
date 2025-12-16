import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SupabaseAdapter } from '@auth/supabase-adapter';
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

// Cliente Supabase para o adapter (usa service role key)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const authOptions: NextAuthOptions = {
  // Adapter para conectar NextAuth com Supabase
  adapter: SupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseServiceRoleKey,
  }),

  // Providers de autenticacao
  providers: [
    // Login com email e senha
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
            throw new Error('Email ou senha incorretos');
          }

          // Verifica se o email foi verificado
          if (!user.email_verified) {
            throw new Error(
              'Email nao verificado. Verifique sua caixa de entrada.'
            );
          }

          // Verifica senha
          if (!user.password) {
            throw new Error(
              'Usuario criado via OAuth. Use login social ou redefina sua senha.'
            );
          }

          const isPasswordValid = await verifyPassword(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Email ou senha incorretos');
          }

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
            throw error;
          }
          throw new Error('Erro ao fazer login');
        }
      },
    }),

    // TODO: Adicionar Google OAuth aqui (Fase futura)
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
  ],

  // Configuracao de sessoes
  session: {
    strategy: 'jwt', // Usa JWT em vez de sessoes no banco
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  // Paginas customizadas
  pages: {
    signIn: '/login',
    error: '/login', // Erros redirecionam para login
    verifyRequest: '/login', // Email de verificacao enviado
  },

  // Callbacks para customizar comportamento
  callbacks: {
    // Callback JWT: adiciona dados extras no token
    async jwt({ token, user, account }) {
      // Primeiro login: adiciona dados do usuario ao token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.emailVerified = user.emailVerified;
      }

      // Login via OAuth: busca ou cria usuario
      if (account?.provider && account.provider !== 'credentials') {
        try {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id, email, name, image, email_verified')
            .eq('email', token.email!)
            .single();

          if (existingUser) {
            token.id = existingUser.id;
            token.emailVerified = existingUser.email_verified
              ? new Date(existingUser.email_verified)
              : null;
          }
        } catch (error) {
          console.error('Erro ao buscar usuario OAuth:', error);
        }
      }

      return token;
    },

    // Callback Session: expoe dados do token para o cliente
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
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

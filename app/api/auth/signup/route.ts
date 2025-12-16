import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashPassword, validateEmail, validatePassword } from '@/lib/auth-utils';
import { sendVerificationEmail } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validacoes basicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha sao obrigatorios' },
        { status: 400 }
      );
    }

    // Valida email
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Email invalido' },
        { status: 400 }
      );
    }

    // Valida senha
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Verifica se usuario ja existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email ja cadastrado' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Cria usuario no banco
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        email_verified: null, // Nao verificado ainda
      })
      .select('id, email')
      .single();

    if (createError || !newUser) {
      console.error('Erro ao criar usuario:', createError);
      return NextResponse.json(
        { error: 'Erro ao criar conta' },
        { status: 500 }
      );
    }

    // Gera token de verificacao
    const verificationToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await supabase.from('verification_tokens').insert({
      identifier: newUser.email,
      token: verificationToken,
      expires: expires.toISOString(),
    });

    // Envia email de verificacao
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`;

    try {
      await sendVerificationEmail(newUser.email, verificationUrl);
    } catch (emailError) {
      console.error('Erro ao enviar email de verificacao:', emailError);
      // Nao retorna erro pois a conta foi criada
    }

    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso. Verifique seu email.',
    });
  } catch (error) {
    console.error('Erro no signup:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

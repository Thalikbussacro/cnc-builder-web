import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateEmail } from '@/lib/auth-utils';
import { sendPasswordResetEmail } from '@/lib/email';

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
    const { email } = body;

    // Validacoes basicas
    if (!email) {
      return NextResponse.json(
        { error: 'Email e obrigatorio' },
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

    // Verifica se usuario existe
    const { data: user } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    // Por seguranca, sempre retorna sucesso mesmo se o email nao existir
    // (evita enumeration attack)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Se o email existir, um link de recuperacao sera enviado.',
      });
    }

    // Gera token de reset
    const resetToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await supabase.from('verification_tokens').insert({
      identifier: `reset_${user.email}`,
      token: resetToken,
      expires: expires.toISOString(),
    });

    // Envia email de reset
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailError) {
      console.error('Erro ao enviar email de reset:', emailError);
      return NextResponse.json(
        { error: 'Erro ao enviar email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email de recuperacao enviado.',
    });
  } catch (error) {
    console.error('Erro no forgot-password:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

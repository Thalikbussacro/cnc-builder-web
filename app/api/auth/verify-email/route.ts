import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/login?error=Token invalido`
      );
    }

    // Busca token de verificacao
    const { data: verificationToken, error: tokenError } = await supabase
      .from('verification_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !verificationToken) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/login?error=Token invalido ou expirado`
      );
    }

    // Verifica se token expirou
    if (new Date(verificationToken.expires) < new Date()) {
      // Remove token expirado
      await supabase
        .from('verification_tokens')
        .delete()
        .eq('token', token);

      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/login?error=Token expirado`
      );
    }

    // Atualiza usuario como verificado
    const { error: updateError } = await supabase
      .from('users')
      .update({ email_verified: new Date().toISOString() })
      .eq('email', verificationToken.identifier);

    if (updateError) {
      console.error('Erro ao verificar email:', updateError);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/login?error=Erro ao verificar email`
      );
    }

    // Remove token usado
    await supabase
      .from('verification_tokens')
      .delete()
      .eq('token', token);

    // Envia email de boas-vindas
    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('email', verificationToken.identifier)
      .single();

    if (user) {
      try {
        await sendWelcomeEmail(user.email, user.name || 'Usuario');
      } catch (emailError) {
        console.error('Erro ao enviar email de boas-vindas:', emailError);
      }
    }

    // Redireciona para login com mensagem de sucesso
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/login?success=Email verificado com sucesso`
    );
  } catch (error) {
    console.error('Erro no verify-email:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/login?error=Erro interno`
    );
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verifica o email do usuário teste
    const { data, error } = await supabase
      .from('users')
      .update({ email_verified: new Date().toISOString() })
      .eq('email', 'teste@teste.com')
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email verificado com sucesso',
      user: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erro inesperado',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

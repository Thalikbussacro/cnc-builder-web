import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Variaveis de ambiente nao configuradas' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Testa conexao listando tabelas
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          error: 'Erro ao conectar no Supabase',
          details: error.message,
          hint: 'Verifique se as tabelas foram criadas no Supabase',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Conexao com Supabase OK!',
      tablesExist: true,
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

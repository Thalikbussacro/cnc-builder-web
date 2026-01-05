import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import type { CreatePresetInput } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// GET /api/presets - Listar presets do usuário
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const favorites = searchParams.get('favorites') === 'true';

    let query = supabase
      .from('config_presets')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false });

    if (favorites) {
      query = query.eq('is_favorite', true);
    }

    const { data: presets, error } = await query;

    if (error) {
      console.error('Error fetching presets:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ presets });
  } catch (error) {
    console.error('Error in GET /api/presets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/presets - Criar novo preset
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreatePresetInput = await request.json();

    // Validações básicas
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Nome do preset é obrigatório' },
        { status: 400 }
      );
    }

    const { data: preset, error } = await supabase
      .from('config_presets')
      .insert({
        user_id: session.user.id,
        name: body.name,
        description: body.description || null,
        config_chapa: body.config_chapa,
        config_corte: body.config_corte,
        config_ferramenta: body.config_ferramenta,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating preset:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ preset }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/presets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

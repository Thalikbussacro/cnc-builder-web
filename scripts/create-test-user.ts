import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carrega .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Carrega variaveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variaveis de ambiente nao configuradas!');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'OK' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  console.log('🚀 Criando usuario de teste...\n');

  const email = 'teste@teste.com';
  const password = 'Teste123!';
  const name = 'Usuario Teste';

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, 10);

  // Cria o usuario
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: email.toLowerCase(),
      name: name,
      password: hashedPassword,
      email_verified: new Date().toISOString(), // Ja marca como verificado
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      console.log('⚠️  Usuario ja existe!');
      console.log('   Email:', email);
      console.log('   Senha:', password);
      return;
    }
    console.error('❌ Erro ao criar usuario:', error.message);
    process.exit(1);
  }

  console.log('✅ Usuario criado com sucesso!');
  console.log('');
  console.log('📧 Email:', email);
  console.log('🔐 Senha:', password);
  console.log('👤 Nome:', name);
  console.log('');
  console.log('🎯 Use essas credenciais para fazer login!');
}

createTestUser();

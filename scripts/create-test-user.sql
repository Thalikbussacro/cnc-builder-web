-- Cria usuario de teste
-- Email: teste@teste.com
-- Senha: Teste123!

INSERT INTO public.users (email, name, password, email_verified, created_at, updated_at)
VALUES (
  'teste@teste.com',
  'Usuario Teste',
  -- Senha hasheada com bcrypt (Teste123!)
  '$2a$10$8qK5yC3IGxO9Yv6.wG6o5uFjh5bfOKfF1NXvVmN7kPx0n1JvAFrSC',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verifica se o usuario foi criado
SELECT id, email, name, email_verified
FROM public.users
WHERE email = 'teste@teste.com';

-- Marca o email do usuario como verificado
-- Substitua pelo seu email se necessario

UPDATE public.users
SET email_verified = NOW(),
    updated_at = NOW()
WHERE email = 'thalikbussacro@gmail.com';

-- Verifica se foi atualizado
SELECT id, email, name, email_verified, created_at
FROM public.users
WHERE email = 'thalikbussacro@gmail.com';

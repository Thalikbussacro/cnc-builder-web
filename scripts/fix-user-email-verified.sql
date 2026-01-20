-- Script para verificar e corrigir o usuário thalikbussacro@gmail.com

-- 1. Verifica se o usuário existe
SELECT
    id,
    email,
    name,
    email_verified,
    created_at,
    CASE
        WHEN password IS NOT NULL THEN 'Sim'
        ELSE 'Não'
    END as tem_senha
FROM public.users
WHERE email = 'thalikbussacro@gmail.com';

-- 2. Se o usuário existe mas email_verified é NULL, execute:
UPDATE public.users
SET
    email_verified = NOW(),
    updated_at = NOW()
WHERE email = 'thalikbussacro@gmail.com'
AND email_verified IS NULL;

-- 3. Verifica o resultado
SELECT
    id,
    email,
    name,
    email_verified,
    created_at
FROM public.users
WHERE email = 'thalikbussacro@gmail.com';

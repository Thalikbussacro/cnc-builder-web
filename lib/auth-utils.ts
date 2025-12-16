import bcrypt from 'bcryptjs';

/**
 * Hash a senha usando bcrypt
 * @param password Senha em texto plano
 * @returns Promise com hash da senha
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verifica se a senha corresponde ao hash
 * @param password Senha em texto plano
 * @param hashedPassword Hash armazenado no banco
 * @returns Promise<boolean> true se a senha está correta
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Valida requisitos mínimos de senha
 * @param password Senha a validar
 * @returns Objeto com validação e mensagem de erro
 */
export function validatePassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return {
      valid: false,
      message: 'Senha deve ter no minimo 8 caracteres',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Senha deve conter pelo menos uma letra maiuscula',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Senha deve conter pelo menos uma letra minuscula',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Senha deve conter pelo menos um numero',
    };
  }

  return { valid: true };
}

/**
 * Valida formato de email
 * @param email Email a validar
 * @returns boolean true se email é válido
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

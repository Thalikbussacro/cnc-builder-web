import DOMPurify from 'dompurify';

/**
 * Sanitiza string removendo HTML tags e scripts potencialmente perigosos
 * Previne ataques XSS (Cross-Site Scripting)
 *
 * @param str - String a ser sanitizada
 * @returns String limpa sem tags HTML ou scripts
 */
export function sanitizeString(str: string): string {
  // Remove todas as HTML tags e scripts
  return DOMPurify.sanitize(str, { ALLOWED_TAGS: [] });
}

/**
 * Sanitiza múltiplas strings de uma vez
 *
 * @param strings - Array de strings a serem sanitizadas
 * @returns Array de strings limpas
 */
export function sanitizeStrings(strings: string[]): string[] {
  return strings.map(sanitizeString);
}

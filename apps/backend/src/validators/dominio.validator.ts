/**
 * Validador de Dominio como función pura
 * Reutilizable en frontend (Angular) y backend (NestJS)
 *
 * Formatos válidos:
 * - AAA999 (3 letras + 3 números) → ABC123
 * - AA999AA (2 letras + 3 números + 2 letras) → AB123CD
 */

/**
 * Valida que el dominio tenga uno de los dos formatos válidos
 *
 * @param dominio - String con el dominio
 * @returns true si es válido, false si no
 *
 * @example
 * isValidDominio('ABC123') // true (AAA999)
 * isValidDominio('AB123CD') // true (AA999AA)
 * isValidDominio('A1B2C3') // false (formato incorrecto)
 */
export function isValidDominio(dominio: string): boolean {
  if (!dominio || typeof dominio !== 'string') {
    return false;
  }

  // Normaliza a mayúsculas
  const dominioUpper = dominio.toUpperCase().trim();

  // Regex: AAA999 o AA999AA
  const dominioRegex = /^[A-Z]{2,3}\d{3}[A-Z]{0,2}$/;

  return dominioRegex.test(dominioUpper);
}

/**
 * Normaliza un dominio (mayúsculas, quita espacios)
 *
 * @param dominio - Dominio sin normalizar
 * @returns Dominio normalizado
 *
 * @example
 * normalizeDominio('abc 123') // 'ABC123'
 * normalizeDominio('ab 123 cd') // 'AB123CD'
 */
export function normalizeDominio(dominio: string): string {
  if (!dominio) return '';
  return dominio.toUpperCase().replace(/\s+/g, '').trim();
}

/**
 * Valida y normaliza dominio en una sola operación
 *
 * @param dominio - Dominio sin normalizar
 * @returns objeto con isValid y valor normalizado
 *
 * @example
 * validateAndNormalizeDominio('abc 123')
 * // { isValid: true, normalized: 'ABC123' }
 */
export function validateAndNormalizeDominio(dominio: string): {
  isValid: boolean;
  normalized: string;
} {
  const normalized = normalizeDominio(dominio);
  return {
    isValid: isValidDominio(normalized),
    normalized,
  };
}

/**
 * Retorna el formato del dominio (útil para debug/logging)
 *
 * @param dominio - Dominio validado
 * @returns 'AAA999' | 'AA999AA' | 'INVALID'
 *
 * @example
 * getDominioFormat('ABC123') // 'AAA999'
 * getDominioFormat('AB123CD') // 'AA999AA'
 */
export function getDominioFormat(dominio: string): string {
  if (!dominio) return 'INVALID';

  const dominioUpper = dominio.toUpperCase().trim();

  if (/^[A-Z]{3}\d{3}$/.test(dominioUpper)) {
    return 'AAA999';
  }

  if (/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(dominioUpper)) {
    return 'AA999AA';
  }

  return 'INVALID';
}

/**
 * Validador de CUIT como función pura (sin decoradores)
 * Reutilizable en frontend (Angular) y backend (NestJS)
 *
 * Algoritmo módulo 11 según AFIP
 * https://www.afip.gob.ar/
 */

/**
 * Valida que el CUIT sea válido (11 dígitos + módulo 11)
 *
 * @param cuit - String de 11 dígitos
 * @returns true si es válido, false si no
 *
 * @example
 * isValidCUIT('20123456789') // true
 * isValidCUIT('20123456788') // false (checksum inválido)
 * isValidCUIT('201234567') // false (menos de 11 dígitos)
 */
export function isValidCUIT(cuit: string): boolean {
  // Paso 1: Validar que sea string y tenga 11 caracteres
  if (!cuit || typeof cuit !== 'string' || cuit.length !== 11) {
    return false;
  }

  // Paso 2: Validar que sean todos dígitos
  if (!/^\d{11}$/.test(cuit)) {
    return false;
  }

  // Paso 3: Validar módulo 11
  return validateCUITChecksum(cuit);
}

/**
 * Calcula y valida el dígito verificador (módulo 11)
 *
 * Algoritmo CUIT (AFIP):
 * 1. Multiplica los primeros 10 dígitos por [5,4,3,2,7,6,5,4,3,2]
 * 2. Suma los resultados
 * 3. Calcula: (11 - (suma % 11)) % 11
 * 4. Compara con el dígito 11 (posición 10)
 *
 * @param cuit - CUIT de 11 dígitos
 * @returns true si el checksum es válido
 *
 * @example
 * validateCUITChecksum('20123456789') // true
 */
function validateCUITChecksum(cuit: string): boolean {
  const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;

  // Multiplica cada dígito (0-9) por su multiplicador
  for (let i = 0; i < 10; i++) {
    const digito = parseInt(cuit[i], 10);
    suma += digito * multiplicadores[i];
  }

  // Calcula el dígito verificador esperado
  const resto = suma % 11;
  const digitoEsperado = 11 - resto;
  const digitoVerificador = digitoEsperado === 11 ? 0 : digitoEsperado;

  // Obtiene el dígito real (posición 10)
  const digitoReal = parseInt(cuit[10], 10);

  // Compara
  return digitoReal === digitoVerificador;
}

/**
 * Normaliza un CUIT quitando espacios y caracteres especiales
 *
 * @param cuit - CUIT con posibles espacios o guiones
 * @returns CUIT limpio (solo dígitos)
 *
 * @example
 * normalizeCUIT('20-123456789') // '20123456789'
 * normalizeCUIT('20 123 456 789') // '20123456789'
 */
export function normalizeCUIT(cuit: string): string {
  if (!cuit) return '';
  return cuit.replace(/[^0-9]/g, '');
}

/**
 * Valida y normaliza CUIT en una sola operación
 *
 * @param cuit - CUIT con posibles espacios/guiones
 * @returns objeto con isValid y valor normalizado
 *
 * @example
 * validateAndNormalizeCUIT('20-123456789')
 * // { isValid: true, normalized: '20123456789' }
 */
export function validateAndNormalizeCUIT(cuit: string): {
  isValid: boolean;
  normalized: string;
} {
  const normalized = normalizeCUIT(cuit);
  return {
    isValid: isValidCUIT(normalized),
    normalized,
  };
}

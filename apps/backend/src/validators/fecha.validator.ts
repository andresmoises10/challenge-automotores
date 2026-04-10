/**
 * Validador de Fecha de Fabricación como función pura
 * Reutilizable en frontend (Angular) y backend (NestJS)
 *
 * Formato: YYYYMM
 * - YYYY: año (4 dígitos)
 * - MM: mes (01-12)
 *
 * Restricción: No puede ser fecha futura
 *
 * @example
 * isValidFechaFabricacion('202401') // true (enero 2024)
 * isValidFechaFabricacion('202599') // false (mes inválido)
 * isValidFechaFabricacion('202901') // false (año futuro)
 */

/**
 * Valida que la fecha de fabricación sea válida
 *
 * @param fecha - String formato YYYYMM
 * @returns true si es válido, false si no
 */
export function isValidFechaFabricacion(fecha: string): boolean {
  if (!fecha || typeof fecha !== 'string') {
    return false;
  }

  // Paso 1: Validar formato YYYYMM
  if (!/^\d{6}$/.test(fecha)) {
    return false;
  }

  // Paso 2: Extraer año y mes
  const year = parseInt(fecha.substring(0, 4), 10);
  const month = parseInt(fecha.substring(4, 6), 10);

  // Paso 3: Validar que mes sea 01-12
  if (month < 1 || month > 12) {
    return false;
  }

  // Paso 4: Validar que no sea fecha futura
  const fechaIngresada = new Date(year, month - 1, 1);
  const ahora = new Date();

  return fechaIngresada <= ahora;
}

/**
 * Normaliza una fecha (quita espacios, guiones, etc.)
 *
 * @param fecha - Fecha sin normalizar (ej: '2024-01' o '2024 01')
 * @returns Fecha normalizada YYYYMM
 *
 * @example
 * normalizeFechaFabricacion('2024-01') // '202401'
 * normalizeFechaFabricacion('2024 / 01') // '202401'
 */
export function normalizeFechaFabricacion(fecha: string): string {
  if (!fecha) return '';

  const normalized = fecha.replace(/[^0-9]/g, '');

  // Si tiene 6 dígitos, retorna directamente
  if (normalized.length === 6) {
    return normalized;
  }

  // Si tiene 8 dígitos (YYYYMMDD), toma solo YYYYMM
  if (normalized.length >= 6) {
    return normalized.substring(0, 6);
  }

  return '';
}

/**
 * Valida y normaliza fecha en una sola operación
 *
 * @param fecha - Fecha sin normalizar
 * @returns objeto con isValid y valor normalizado
 *
 * @example
 * validateAndNormalizeFechaFabricacion('2024-01')
 * // { isValid: true, normalized: '202401' }
 */
export function validateAndNormalizeFechaFabricacion(fecha: string): {
  isValid: boolean;
  normalized: string;
} {
  const normalized = normalizeFechaFabricacion(fecha);
  return {
    isValid: isValidFechaFabricacion(normalized),
    normalized,
  };
}

/**
 * Convierte fecha YYYYMM a objeto Date
 *
 * @param fecha - Fecha formato YYYYMM
 * @returns Date object (primer día del mes)
 *
 * @example
 * fechaToDate('202401') // Date(2024-01-01)
 */
export function fechaToDate(fecha: string): Date {
  if (!isValidFechaFabricacion(fecha)) {
    throw new Error('Fecha inválida: ' + fecha);
  }

  const year = parseInt(fecha.substring(0, 4), 10);
  const month = parseInt(fecha.substring(4, 6), 10);

  return new Date(year, month - 1, 1);
}

/**
 * Retorna la fecha actual en formato YYYYMM
 *
 * @returns fecha actual YYYYMM
 *
 * @example
 * getCurrentFechaFabricacion() // '202404' (si es abril 2024)
 */
export function getCurrentFechaFabricacion(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  return `${year}${month}`;
}

/**
 * Valida que una fecha NO sea futura
 * (Usado en servicios para validación adicional)
 *
 * @param fecha - Fecha formato YYYYMM
 * @returns true si es pasada, false si es futura
 */
export function isFechaPasada(fecha: string): boolean {
  if (!isValidFechaFabricacion(fecha)) {
    return false;
  }

  const fechaIngresada = fechaToDate(fecha);
  const ahora = new Date();

  return fechaIngresada < ahora;
}

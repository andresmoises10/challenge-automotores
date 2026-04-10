/**
 * Validar CUIT con módulo 11
 * Formato: 20-12345678-9 o 20123456789
 */
export function isCuitValid(value: string): boolean {
  if (!value) return false;

  // Remover guiones
  const cuit = value.replace(/-/g, '');

  // Debe ser 11 dígitos
  if (!/^\d{11}$/.test(cuit)) {
    return false;
  }

  // Validar módulo 11 (dígito verificador)
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += parseInt(cuit[i], 10) * multipliers[i];
  }

  const remainder = sum % 11;
  const checkDigit = remainder === 0 ? 0 : 11 - remainder;

  return checkDigit === parseInt(cuit[10], 10);
}

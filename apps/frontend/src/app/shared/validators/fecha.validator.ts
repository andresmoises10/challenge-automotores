export function isFechaFabricacionValid(value: string): boolean {
  if (!value) return false;

  // Debe ser exactamente 6 dígitos
  if (!/^\d{6}$/.test(value)) {
    return false;
  }

  const year = parseInt(value.substring(0, 4), 10);
  const month = parseInt(value.substring(4, 6), 10);

  // Mes debe ser 01-12
  if (month < 1 || month > 12) {
    return false;
  }

  // No puede ser fecha futura
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  if (year > currentYear) {
    return false;
  }

  if (year === currentYear && month > currentMonth) {
    return false;
  }

  return true;
}

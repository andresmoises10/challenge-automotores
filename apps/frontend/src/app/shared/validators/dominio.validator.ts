export function isDominioValid(value: string): boolean {
  if (!value) return false;

  // Remover espacios
  const dominio = value.toUpperCase().trim();

  // Patrón: 3 letras + 3 números O 2 letras + 3 números + 2 letras
  const pattern = /^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/;

  return pattern.test(dominio);
}

import { FormControl } from '@angular/forms';

import { isCuitValid } from './cuit.validator';
import { isDominioValid } from './dominio.validator';
import { isFechaFabricacionValid } from './fecha.validator';
import { cuitValidator } from './reactive-validators/cuit.reactive.validator';
import { dominioValidator } from './reactive-validators/dominio.reactive.validator';
import { fechaFabricacionValidator } from './reactive-validators/fabricacion.reactive.validator';

// ---------------------------------------------------------------------------
// isCuitValid
// ---------------------------------------------------------------------------
describe('isCuitValid', () => {
  it('returns false for empty string', () => {
    expect(isCuitValid('')).toBeFalse();
  });

  it('returns false for null/undefined', () => {
    expect(isCuitValid(null as any)).toBeFalse();
    expect(isCuitValid(undefined as any)).toBeFalse();
  });

  it('returns false when less than 11 digits', () => {
    expect(isCuitValid('2030678901')).toBeFalse();
  });

  it('returns false when more than 11 digits', () => {
    expect(isCuitValid('203067890166')).toBeFalse();
  });

  it('returns false when contains non-digit characters (without hyphens)', () => {
    expect(isCuitValid('2030A789016')).toBeFalse();
  });

  it('returns false for well-formed CUIT with wrong check digit', () => {
    // 20123456789: check digit should be 6, not 9
    expect(isCuitValid('20123456789')).toBeFalse();
  });

  it('returns true for valid CUIT without hyphens', () => {
    expect(isCuitValid('30678901233')).toBeTrue();
  });

  it('returns true for valid CUIT with hyphens (strips them)', () => {
    expect(isCuitValid('30-67890123-3')).toBeTrue();
  });

  it('returns true for another valid CUIT', () => {
    expect(isCuitValid('33693450239')).toBeTrue();
  });

  it('returns true for valid CUIT starting with 20', () => {
    expect(isCuitValid('20306789016')).toBeTrue();
  });
});

// ---------------------------------------------------------------------------
// cuitValidator (reactive)
// ---------------------------------------------------------------------------
describe('cuitValidator', () => {
  const validator = cuitValidator();

  it('returns null when control is empty (required handles this)', () => {
    const control = new FormControl('');
    expect(validator(control)).toBeNull();
  });

  it('returns null for valid CUIT', () => {
    const control = new FormControl('30678901233');
    expect(validator(control)).toBeNull();
  });

  it('returns invalidCuit error for invalid CUIT', () => {
    const control = new FormControl('20123456789');
    const result = validator(control);
    expect(result).not.toBeNull();
    expect(result!['invalidCuit']).toBeDefined();
  });

  it('returns invalidCuit error for non-numeric value', () => {
    const control = new FormControl('ABCDEFGHIJK');
    expect(validator(control)!['invalidCuit']).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// isDominioValid
// ---------------------------------------------------------------------------
describe('isDominioValid', () => {
  it('returns false for empty string', () => {
    expect(isDominioValid('')).toBeFalse();
  });

  it('returns false for null/undefined', () => {
    expect(isDominioValid(null as any)).toBeFalse();
  });

  it('returns true for old format AAA999 (uppercase)', () => {
    expect(isDominioValid('ABC123')).toBeTrue();
  });

  it('returns true for old format aaa999 (lowercase, normalizes internally)', () => {
    expect(isDominioValid('abc123')).toBeTrue();
  });

  it('returns true for Mercosur format AA999AA', () => {
    expect(isDominioValid('AB123CD')).toBeTrue();
  });

  it('returns true for Mercosur format lowercase', () => {
    expect(isDominioValid('ab123cd')).toBeTrue();
  });

  it('returns false for only letters', () => {
    expect(isDominioValid('ABCDEF')).toBeFalse();
  });

  it('returns false for only numbers', () => {
    expect(isDominioValid('123456')).toBeFalse();
  });

  it('returns false for wrong length (4 letters + 3 numbers)', () => {
    expect(isDominioValid('ABCD123')).toBeFalse();
  });

  it('returns false for too short', () => {
    expect(isDominioValid('AB12')).toBeFalse();
  });

  it('returns false for format with spaces', () => {
    expect(isDominioValid('ABC 123')).toBeFalse();
  });

  it('returns false for old format with extra character', () => {
    expect(isDominioValid('ABC1234')).toBeFalse();
  });
});

// ---------------------------------------------------------------------------
// dominioValidator (reactive)
// ---------------------------------------------------------------------------
describe('dominioValidator', () => {
  const validator = dominioValidator();

  it('returns null when control is empty', () => {
    const control = new FormControl('');
    expect(validator(control)).toBeNull();
  });

  it('returns null for valid dominio AAA999', () => {
    const control = new FormControl('ABC123');
    expect(validator(control)).toBeNull();
  });

  it('returns null for valid dominio AA999AA', () => {
    const control = new FormControl('AB123CD');
    expect(validator(control)).toBeNull();
  });

  it('returns invalidDominio error for invalid format', () => {
    const control = new FormControl('INVALID');
    const result = validator(control);
    expect(result).not.toBeNull();
    expect(result!['invalidDominio']).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// isFechaFabricacionValid  (date-sensitive — baseline: 2026-04)
// ---------------------------------------------------------------------------
describe('isFechaFabricacionValid', () => {
  it('returns false for empty string', () => {
    expect(isFechaFabricacionValid('')).toBeFalse();
  });

  it('returns false for null/undefined', () => {
    expect(isFechaFabricacionValid(null as any)).toBeFalse();
  });

  it('returns false for less than 6 digits', () => {
    expect(isFechaFabricacionValid('20241')).toBeFalse();
  });

  it('returns false for more than 6 digits', () => {
    expect(isFechaFabricacionValid('2024011')).toBeFalse();
  });

  it('returns false for month 0', () => {
    expect(isFechaFabricacionValid('202400')).toBeFalse();
  });

  it('returns false for month 13', () => {
    expect(isFechaFabricacionValid('202413')).toBeFalse();
  });

  it('returns false for future year', () => {
    expect(isFechaFabricacionValid('202701')).toBeFalse();
  });

  it('returns false for future month in current year', () => {
    expect(isFechaFabricacionValid('202612')).toBeFalse();
  });

  it('returns true for a past date', () => {
    expect(isFechaFabricacionValid('202012')).toBeTrue();
  });

  it('returns true for January of current year', () => {
    expect(isFechaFabricacionValid('202601')).toBeTrue();
  });

  it('returns true for current month', () => {
    expect(isFechaFabricacionValid('202604')).toBeTrue();
  });

  it('returns false for non-numeric characters', () => {
    expect(isFechaFabricacionValid('2024AB')).toBeFalse();
  });
});

// ---------------------------------------------------------------------------
// fechaFabricacionValidator (reactive)
// ---------------------------------------------------------------------------
describe('fechaFabricacionValidator', () => {
  const validator = fechaFabricacionValidator();

  it('returns null when control is empty', () => {
    const control = new FormControl('');
    expect(validator(control)).toBeNull();
  });

  it('returns null for valid past date', () => {
    const control = new FormControl('202012');
    expect(validator(control)).toBeNull();
  });

  it('returns invalidFechaFabricacion error for future date', () => {
    const control = new FormControl('202701');
    const result = validator(control);
    expect(result).not.toBeNull();
    expect(result!['invalidFechaFabricacion']).toBeDefined();
  });

  it('returns invalidFechaFabricacion error for invalid month', () => {
    const control = new FormControl('202400');
    expect(validator(control)!['invalidFechaFabricacion']).toBeDefined();
  });
});

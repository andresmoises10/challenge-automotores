import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  CUIT_REGEX,
  CUIT_MIN_LENGTH,
  VALIDATION_MESSAGES,
  DOMINIO_REGEX,
  FECHA_FABRICACION_REGEX,
  CHASIS_REGEX,
  MOTOR_REGEX,
} from '../../config';

/**
 * Validador custom: @IsCUIT()
 * Valida que sea 11 dígitos + módulo 11
 */
@ValidatorConstraint({ name: 'isCUIT', async: false })
export class IsCUITConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (!value) return false;

    // Primero: debe ser string de 11 dígitos
    if (!CUIT_REGEX.test(value)) return false;

    // Segundo: validar módulo 11
    return this.validateCUITChecksum(value);
  }

  defaultMessage(): string {
    return VALIDATION_MESSAGES.CUIT_INVALID;
  }

  /**
   * Algoritmo módulo 11 para CUIT
   * https://www.afip.gob.ar/
   *
   * CUIT: XX XXXXXXXX X
   *       01 23456789 10
   *
   * Paso 1: Multiplica dígitos 0-9 por [5,4,3,2,7,6,5,4,3,2]
   * Paso 2: Suma los resultados, calcula módulo 11
   * Paso 3: El dígito verificador es (11 - resultado) mod 11
   */
  private validateCUITChecksum(cuit: string): boolean {
    const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;

    // Multiplica los primeros 10 dígitos
    for (let i = 0; i < 10; i++) {
      suma += parseInt(cuit[i], 10) * multiplicadores[i];
    }

    // Calcula el dígito verificador esperado
    const resto = suma % 11;
    const digitoEsperado = 11 - resto;
    const digitoVerificador = digitoEsperado === 11 ? 0 : digitoEsperado;

    // Compara con el dígito real (posición 10)
    return parseInt(cuit[10], 10) === digitoVerificador;
  }
}

/**
 * Decorador: @IsCUIT()
 * Uso: @IsCUIT() cuit: string
 */
export function IsCUIT(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCUITConstraint,
    });
  };
}

// ============ DOMINIO ============

/**
 * Validador custom: @IsDominio()
 * Valida formato AAA999 o AA999AA
 */
@ValidatorConstraint({ name: 'isDominio', async: false })
export class IsDominioConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (!value) return false;
    return DOMINIO_REGEX.test(value);
  }

  defaultMessage(): string {
    return VALIDATION_MESSAGES.DOMINIO_INVALID;
  }
}

export function IsDominio(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsDominioConstraint,
    });
  };
}

// ============ FECHA FABRICACIÓN ============

/**
 * Validador custom: @IsFechaFabricacion()
 * Valida formato YYYYMM y que no sea fecha futura
 */
@ValidatorConstraint({ name: 'isFechaFabricacion', async: false })
export class IsFechaFabricacionConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (!value) return false;

    // Formato YYYYMM
    if (!FECHA_FABRICACION_REGEX.test(value)) return false;

    // No puede ser fecha futura
    const year = parseInt(value.substring(0, 4), 10);
    const month = parseInt(value.substring(4, 6), 10);

    const fechaIngresada = new Date(year, month - 1, 1);
    const ahora = new Date();

    return fechaIngresada <= ahora;
  }

  defaultMessage(): string {
    return VALIDATION_MESSAGES.FECHA_FABRICACION_INVALID;
  }
}

export function IsFechaFabricacion(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFechaFabricacionConstraint,
    });
  };
}

// ============ CHASIS ============

/**
 * Validador custom: @IsChasis()
 * Valida alfanumérico, 6-20 caracteres
 */
@ValidatorConstraint({ name: 'isChasis', async: false })
export class IsChasiaConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (!value) return false;
    return CHASIS_REGEX.test(value);
  }

  defaultMessage(): string {
    return VALIDATION_MESSAGES.CHASIS_INVALID;
  }
}

export function IsChasis(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsChasiaConstraint,
    });
  };
}

// ============ MOTOR ============

/**
 * Validador custom: @IsMotor()
 * Valida alfanumérico, 6-20 caracteres
 */
@ValidatorConstraint({ name: 'isMotor', async: false })
export class IsMotorConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (!value) return false;
    return MOTOR_REGEX.test(value);
  }

  defaultMessage(): string {
    return VALIDATION_MESSAGES.MOTOR_INVALID;
  }
}

export function IsMotor(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsMotorConstraint,
    });
  };
}

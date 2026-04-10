/**
 * Constantes globales del backend
 * Reutilizadas en validadores, servicios y controladores
 */

// ============ ENUMS ============

export enum TipoSujeto {
  PERSONA_FISICA = 'PERSONA_FISICA',
}

// ============ VALIDACIONES ============

/**
 * CUIT: 11 dígitos + validación módulo 11
 * Ejemplo: 20123456789
 */
export const CUIT_REGEX = /^\d{11}$/;
export const CUIT_MIN_LENGTH = 11;
export const CUIT_MAX_LENGTH = 11;

/**
 * Dominio: AAA999 o AA999AA
 * Ejemplos: ABC123, AB123CD
 */
export const DOMINIO_REGEX = /^[A-Z]{2,3}\d{3}[A-Z]{0,2}$/;

/**
 * Fecha de fabricación: YYYYMM
 * Ejemplo: 202401 (enero 2024)
 * No puede ser fecha futura
 */
export const FECHA_FABRICACION_REGEX = /^\d{6}$/;

/**
 * Chasis: alfanumérico, 6-20 caracteres
 */
export const CHASIS_REGEX = /^[A-Z0-9]{6,20}$/i;

/**
 * Motor: alfanumérico, 6-20 caracteres
 */
export const MOTOR_REGEX = /^[A-Z0-9]{6,20}$/i;

// ============ PAGINACIÓN ============

export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

// ============ MENSAJES DE VALIDACIÓN ============

export const VALIDATION_MESSAGES = {
  // CUIT
  CUIT_INVALID: 'CUIT debe ser 11 dígitos válidos (módulo 11)',
  CUIT_DUPLICATED: 'Este CUIT ya existe en el sistema',
  CUIT_NOT_FOUND: 'CUIT no encontrado en el sistema',

  // Dominio
  DOMINIO_INVALID: 'Dominio debe ser AAA999 o AA999AA',
  DOMINIO_DUPLICATED: 'Este dominio ya está registrado',

  // Chasis
  CHASIS_INVALID: 'Chasis debe ser alfanumérico de 6 a 20 caracteres',
  CHASIS_DUPLICATED: 'Este número de chasis ya está registrado',

  // Motor
  MOTOR_INVALID: 'Motor debe ser alfanumérico de 6 a 20 caracteres',
  MOTOR_DUPLICATED: 'Este número de motor ya está registrado',

  // Fecha
  FECHA_FABRICACION_INVALID: 'Fecha debe ser YYYYMM (ej: 202401), no puede ser futura',

  // Color
  COLOR_REQUIRED: 'Color es requerido',

  // Tipo sujeto
  TIPO_SUJETO_INVALID: 'Tipo de sujeto debe ser PERSONA_FISICA o PERSONA_JURIDICA',

  // Entidades
  SUJETO_NOT_FOUND: 'Sujeto no encontrado',
  AUTOMOTOR_NOT_FOUND: 'Automotor no encontrado',
};

// ============ CÓDIGOS DE ERROR ============

export const ERROR_CODES = {
  // Validación
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Sujetos
  SUJETO_NOT_FOUND: 'SUJETO_NOT_FOUND',
  CUIT_DUPLICATED: 'CUIT_DUPLICATED',

  // Automotores
  AUTOMOTOR_NOT_FOUND: 'AUTOMOTOR_NOT_FOUND',
  DOMINIO_DUPLICATED: 'DOMINIO_DUPLICATED',
  CHASIS_DUPLICATED: 'CHASIS_DUPLICATED',
  MOTOR_DUPLICATED: 'MOTOR_DUPLICATED',

  // DB
  DATABASE_ERROR: 'DATABASE_ERROR',
};

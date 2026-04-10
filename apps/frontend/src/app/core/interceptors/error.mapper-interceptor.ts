import { HttpErrorResponse } from '@angular/common/http';
import {ApiErrorInterface} from '../models';

export const mapHttpError = (error: HttpErrorResponse): ApiErrorInterface => {
  if (error.status === 422) {
    return {
      code: 'VALIDATION_ERROR',
      message: error.error?.message || 'Validación fallida.',
      userMessage: 'Revisa los datos ingresados.',
      fieldErrors: error.error?.fieldErrors || {},
      status: 422,
      timestamp: new Date().toISOString(),
    };
  }

  if (error.status === 404) {
    return {
      code: 'NOT_FOUND',
      message: error.error?.message || 'Recurso no encontrado.',
      userMessage: 'El elemento que buscas no existe.',
      status: 404,
      timestamp: new Date().toISOString(),
    };
  }

  if (error.status === 400) {
    return {
      code: 'BAD_REQUEST',
      message: error.error?.message || 'Solicitud inválida.',
      userMessage: error.error?.userMessage || 'Solicitud inválida.',
      status: 400,
      timestamp: new Date().toISOString(),
    };
  }

  if (error.status === 0) {
    // Network error
    return {
      code: 'NETWORK_ERROR',
      message: 'No hay conexión con el servidor.',
      userMessage: 'No se puede conectar al servidor. Verifica tu conexión.',
      status: 0,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'Error desconocido.',
    userMessage: 'Algo salió mal. Intenta nuevamente.',
    status: error.status,
    timestamp: new Date().toISOString(),
  };
};

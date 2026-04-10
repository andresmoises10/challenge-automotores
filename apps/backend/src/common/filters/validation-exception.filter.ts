import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let fieldErrors: Record<string, string> = {};

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const errObj = exceptionResponse as any;

      // 1. Error de negocio con fieldErrors (DOMINIO_DUPLICATED, CHASIS_DUPLICATED, etc.)
      //    → 422 para que el frontend los muestre campo por campo
      if (errObj.fieldErrors && typeof errObj.fieldErrors === 'object') {
        response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          code: errObj.code || 'VALIDATION_ERROR',
          message: errObj.message || 'Validación fallida',
          fieldErrors: errObj.fieldErrors,
        });
        return;
      }

      // 2. Error de negocio sin fieldErrors (SUJETO_NOT_FOUND, etc.)
      //    → 400 con el code original para que el frontend lo detecte
      if (errObj.code && !Array.isArray(errObj.message)) {
        response.status(status).json({
          statusCode: status,
          ...errObj,
        });
        return;
      }

      // 3. Error de class-validator: message es un array de ValidationError
      if (Array.isArray(errObj.message)) {
        fieldErrors = this.mapValidationErrors(errObj.message);
      }
    }

    // 4. Respuesta estándar 422 con fieldErrors de class-validator
    response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      code: 'VALIDATION_ERROR',
      message: 'Validación fallida',
      fieldErrors,
    });
  }

  private mapValidationErrors(validationErrors: any[]): Record<string, string> {
    const fieldErrors: Record<string, string> = {};

    validationErrors.forEach((error) => {
      const { property, constraints } = error;
      if (constraints) {
        const constraintKey = Object.keys(constraints)[0];
        fieldErrors[property] = constraints[constraintKey];
      }
    });

    return fieldErrors;
  }
}

import { mapHttpError } from './error.mapper-interceptor';
import { HttpErrorResponse } from '@angular/common/http';

function makeError(status: number, body: any = {}): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: body, url: '/api/test' });
}

describe('mapHttpError', () => {
  describe('422 Unprocessable Entity', () => {
    it('returns VALIDATION_ERROR code by default', () => {
      const result = mapHttpError(makeError(422));
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.status).toBe(422);
    });

    it('preserves code from response body when present', () => {
      const result = mapHttpError(makeError(422, { code: 'DOMINIO_DUPLICATED' }));
      expect(result.code).toBe('DOMINIO_DUPLICATED');
    });

    it('returns fieldErrors from response body', () => {
      const body = { fieldErrors: { dominio: 'Ya existe.' } };
      const result = mapHttpError(makeError(422, body));
      expect(result.fieldErrors?.['dominio']).toBe('Ya existe.');
    });

    it('returns empty fieldErrors when not present in body', () => {
      const result = mapHttpError(makeError(422));
      expect(result.fieldErrors).toEqual({});
    });
  });

  describe('400 Bad Request', () => {
    it('returns BAD_REQUEST code by default', () => {
      const result = mapHttpError(makeError(400));
      expect(result.code).toBe('BAD_REQUEST');
      expect(result.status).toBe(400);
    });

    it('preserves code from response body', () => {
      const result = mapHttpError(makeError(400, { code: 'SUJETO_NOT_FOUND' }));
      expect(result.code).toBe('SUJETO_NOT_FOUND');
    });

    it('returns specific userMessage for SUJETO_NOT_FOUND', () => {
      const result = mapHttpError(makeError(400, { code: 'SUJETO_NOT_FOUND' }));
      expect(result.userMessage).toContain('CUIT');
    });

    it('returns generic userMessage for other 400 errors', () => {
      const result = mapHttpError(makeError(400, { userMessage: 'Datos incorrectos.' }));
      expect(result.userMessage).toBe('Datos incorrectos.');
    });
  });

  describe('404 Not Found', () => {
    it('returns NOT_FOUND code', () => {
      const result = mapHttpError(makeError(404));
      expect(result.code).toBe('NOT_FOUND');
      expect(result.status).toBe(404);
    });

    it('returns user-friendly message', () => {
      const result = mapHttpError(makeError(404));
      expect(result.userMessage).toBeTruthy();
    });
  });

  describe('0 Network Error', () => {
    it('returns NETWORK_ERROR code', () => {
      const result = mapHttpError(makeError(0));
      expect(result.code).toBe('NETWORK_ERROR');
      expect(result.status).toBe(0);
    });

    it('returns connection error message', () => {
      const result = mapHttpError(makeError(0));
      expect(result.userMessage).toContain('servidor');
    });
  });

  describe('unknown errors', () => {
    it('returns UNKNOWN_ERROR code for 500', () => {
      const result = mapHttpError(makeError(500));
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.status).toBe(500);
    });

    it('returns UNKNOWN_ERROR code for 503', () => {
      const result = mapHttpError(makeError(503));
      expect(result.code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('timestamp', () => {
    it('always includes a timestamp', () => {
      const result = mapHttpError(makeError(422));
      expect(result.timestamp).toBeTruthy();
      expect(new Date(result.timestamp!).getTime()).not.toBeNaN();
    });
  });
});

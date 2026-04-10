import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ErrorInterceptor } from './error.interceptor-interceptor';

describe('ErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    const interceptor = TestBed.inject(HTTP_INTERCEPTORS);
    expect(interceptor).toBeTruthy();
  });

  it('maps 422 response to ApiErrorInterface with VALIDATION_ERROR', (done) => {
    http.get('/api/test').subscribe({
      error: (err) => {
        expect(err.code).toBe('VALIDATION_ERROR');
        expect(err.status).toBe(422);
        done();
      },
    });

    httpMock.expectOne('/api/test').flush(
      { fieldErrors: { dominio: 'Ya existe.' } },
      { status: 422, statusText: 'Unprocessable Entity' }
    );
  });

  it('maps 400 SUJETO_NOT_FOUND to correct code and message', (done) => {
    http.get('/api/test').subscribe({
      error: (err) => {
        expect(err.code).toBe('SUJETO_NOT_FOUND');
        expect(err.userMessage).toContain('CUIT');
        done();
      },
    });

    httpMock.expectOne('/api/test').flush(
      { code: 'SUJETO_NOT_FOUND' },
      { status: 400, statusText: 'Bad Request' }
    );
  });
});

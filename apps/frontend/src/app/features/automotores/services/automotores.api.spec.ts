import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AutomotolesApiService } from './automotores.api.service';
import { Automotor } from '../../../core/models';

const mockAutomotor: Automotor = {
  dominio: 'ABC123',
  chasis: 'CHS001ABC',
  motor: 'MOT001DEF',
  color: 'Rojo',
  fechaFabricacion: '202001',
  cuit: '30678901233',
};

describe('AutomotolesApiService', () => {
  let service: AutomotolesApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AutomotolesApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAutomotores', () => {
    it('sends GET /api/automotores with page and limit params', () => {
      service.getAutomotores(1, 10).subscribe();
      const req = httpMock.expectOne((r) => r.url === '/api/automotores');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('limit')).toBe('10');
      req.flush({ data: [], total: 0 });
    });
  });

  describe('getAutomotorByDominio', () => {
    it('sends GET /api/automotores/:dominio', () => {
      service.getAutomotorByDominio('ABC123').subscribe((result) => {
        expect(result).toEqual(mockAutomotor);
      });
      const req = httpMock.expectOne('/api/automotores/ABC123');
      expect(req.request.method).toBe('GET');
      req.flush(mockAutomotor);
    });
  });

  describe('createAutomotor', () => {
    it('sends POST /api/automotores with payload', () => {
      service.createAutomotor(mockAutomotor).subscribe((result) => {
        expect(result).toEqual(mockAutomotor);
      });
      const req = httpMock.expectOne('/api/automotores');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockAutomotor);
      req.flush(mockAutomotor);
    });
  });

  describe('updateAutomotor', () => {
    it('sends PUT /api/automotores/:dominio with payload', () => {
      const update = { color: 'Azul' };
      service.updateAutomotor('ABC123', update).subscribe();
      const req = httpMock.expectOne('/api/automotores/ABC123');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(update);
      req.flush({ ...mockAutomotor, ...update });
    });
  });

  describe('deleteAutomotor', () => {
    it('sends DELETE /api/automotores/:dominio', () => {
      service.deleteAutomotor('ABC123').subscribe();
      const req = httpMock.expectOne('/api/automotores/ABC123');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});

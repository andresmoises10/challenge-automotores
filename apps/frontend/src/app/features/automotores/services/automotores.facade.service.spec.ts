import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AutomotoresFacadeService } from './automotores.facade.service';
import { AutomotolesApiService } from './automotores.api.service';
import { AutomotoresStateService } from './automotores.state.service';
import { Automotor } from '../../../core/models';

const mockAutomotor: Automotor = {
  dominio: 'ABC123',
  chasis: 'CHS001ABC',
  motor: 'MOT001DEF',
  color: 'Rojo',
  fechaFabricacion: '202001',
  cuit: '30678901233',
};

describe('AutomotoresFacadeService', () => {
  let service: AutomotoresFacadeService;
  let mockApi: jasmine.SpyObj<AutomotolesApiService>;
  let mockState: jasmine.SpyObj<AutomotoresStateService>;

  beforeEach(() => {
    mockApi = jasmine.createSpyObj('AutomotolesApiService', [
      'getAutomotores',
      'getAutomotorByDominio',
      'createAutomotor',
      'updateAutomotor',
      'deleteAutomotor',
    ]);

    mockState = jasmine.createSpyObj('AutomotoresStateService', [
      'setLoading',
      'setError',
      'setAutomotores',
      'setCurrentPage',
      'addAutomotor',
      'updateAutomotor',
      'removeAutomotor',
      'setSearchTerm',
      'reset',
    ], {
      automotores: jasmine.createSpy(),
      loading: jasmine.createSpy(),
      error: jasmine.createSpy(),
      filteredAutomotores: jasmine.createSpy(),
    });

    // Default: loadAutomotores (called in constructor) returns empty list
    mockApi.getAutomotores.and.returnValue(of({ data: [], total: 0 }));

    TestBed.configureTestingModule({
      providers: [
        AutomotoresFacadeService,
        { provide: AutomotolesApiService, useValue: mockApi },
        { provide: AutomotoresStateService, useValue: mockState },
      ],
    });

    service = TestBed.inject(AutomotoresFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadAutomotores', () => {
    it('sets loading to true then false', () => {
      mockApi.getAutomotores.and.returnValue(of({ data: [mockAutomotor], total: 1 }));
      service.loadAutomotores();
      expect(mockState.setLoading).toHaveBeenCalledWith(true);
      expect(mockState.setLoading).toHaveBeenCalledWith(false);
    });

    it('calls setAutomotores with response data', () => {
      mockApi.getAutomotores.and.returnValue(of({ data: [mockAutomotor], total: 1 }));
      service.loadAutomotores();
      expect(mockState.setAutomotores).toHaveBeenCalledWith([mockAutomotor]);
    });

    it('calls setError on API failure', () => {
      const apiError = { code: 'NETWORK_ERROR', message: 'Network error', userMessage: 'Sin conexión.' };
      mockApi.getAutomotores.and.returnValue(throwError(() => apiError));
      service.loadAutomotores();
      expect(mockState.setError).toHaveBeenCalledWith(apiError);
    });
  });

  describe('createAutomotor', () => {
    it('calls api.createAutomotor and updates state', () => {
      mockApi.createAutomotor.and.returnValue(of(mockAutomotor));
      service.createAutomotor(mockAutomotor).subscribe();
      expect(mockApi.createAutomotor).toHaveBeenCalledWith(mockAutomotor);
      expect(mockState.addAutomotor).toHaveBeenCalledWith(mockAutomotor);
    });

    it('rethrows error on API failure', (done) => {
      const apiError = { code: 'VALIDATION_ERROR', message: 'Validation error', userMessage: 'Revisa los datos.', fieldErrors: { dominio: 'Ya existe.' } };
      mockApi.createAutomotor.and.returnValue(throwError(() => apiError));
      service.createAutomotor(mockAutomotor).subscribe({
        error: (err) => {
          expect(err).toEqual(apiError);
          done();
        },
      });
    });
  });

  describe('updateAutomotor', () => {
    it('calls api.updateAutomotor and updates state', () => {
      const updated = { ...mockAutomotor, color: 'Azul' };
      mockApi.updateAutomotor.and.returnValue(of(updated));
      service.updateAutomotor('ABC123', { color: 'Azul' }).subscribe();
      expect(mockApi.updateAutomotor).toHaveBeenCalledWith('ABC123', { color: 'Azul' });
      expect(mockState.updateAutomotor).toHaveBeenCalledWith(updated);
    });
  });

  describe('deleteAutomotor', () => {
    it('calls api.deleteAutomotor and removes from state', () => {
      mockApi.deleteAutomotor.and.returnValue(of(undefined));
      service.deleteAutomotor('ABC123').subscribe();
      expect(mockApi.deleteAutomotor).toHaveBeenCalledWith('ABC123');
      expect(mockState.removeAutomotor).toHaveBeenCalledWith('ABC123');
    });

    it('rethrows error on API failure', (done) => {
      const apiError = { code: 'NOT_FOUND', message: 'Not found', userMessage: 'No encontrado.' };
      mockApi.deleteAutomotor.and.returnValue(throwError(() => apiError));
      service.deleteAutomotor('ABC123').subscribe({
        error: (err) => {
          expect(err).toEqual(apiError);
          done();
        },
      });
    });
  });

  describe('getAutomotorByDominio', () => {
    it('delegates to api.getAutomotorByDominio', () => {
      mockApi.getAutomotorByDominio.and.returnValue(of(mockAutomotor));
      service.getAutomotorByDominio('ABC123').subscribe((result) => {
        expect(result).toEqual(mockAutomotor);
      });
      expect(mockApi.getAutomotorByDominio).toHaveBeenCalledWith('ABC123');
    });
  });
});

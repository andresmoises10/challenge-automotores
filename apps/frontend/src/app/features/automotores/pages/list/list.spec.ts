import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { AutomotolesListComponent } from './list';
import { AutomotoresFacadeService } from '../../services/automotores.facade.service';
import { Automotor } from '../../../../core/models';

const mockAutomotores: Automotor[] = [
  {
    dominio: 'ABC123',
    chasis: 'CHS001',
    motor: 'MOT001',
    color: 'Rojo',
    fechaFabricacion: '202001',
    cuit: '30678901233',
    sujeto: { id: 1, cuit: '30678901233', nombre: 'Empresa SA', tipo: 'PERSONA_JURIDICA' },
  },
  {
    dominio: 'XY123AB',
    chasis: 'CHS002',
    motor: 'MOT002',
    color: 'Azul',
    fechaFabricacion: '201906',
    cuit: '20306789016',
    sujeto: { id: 2, cuit: '20306789016', nombre: 'Juan Pérez', tipo: 'PERSONA_FISICA' },
  },
];

describe('AutomotolesListComponent', () => {
  let component: AutomotolesListComponent;
  let fixture: ComponentFixture<AutomotolesListComponent>;
  let mockFacade: any;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    mockFacade = {
      automotores: signal<Automotor[]>([]),
      loading: signal(false),
      error: signal<any>(null),
      loadAutomotores: jasmine.createSpy('loadAutomotores'),
      deleteAutomotor: jasmine.createSpy('deleteAutomotor').and.returnValue(of(undefined)),
    };

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [AutomotolesListComponent],
      providers: [
        { provide: AutomotoresFacadeService, useValue: mockFacade },
        { provide: Router, useValue: mockRouter },
        { provide: MessageService, useValue: mockMessageService },
        ConfirmationService,
        provideNoopAnimations(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AutomotolesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calls loadAutomotores on init', () => {
    expect(mockFacade.loadAutomotores).toHaveBeenCalled();
  });

  it('exposes automotores signal from facade', () => {
    expect(component.automotores).toBe(mockFacade.automotores);
  });

  it('exposes loading signal from facade', () => {
    expect(component.loading).toBe(mockFacade.loading);
  });

  it('exposes error signal from facade', () => {
    expect(component.error).toBe(mockFacade.error);
  });

  describe('onNew', () => {
    it('navigates to /automotores/form', () => {
      component.onNew();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/automotores/form']);
    });
  });

  describe('onEdit', () => {
    it('navigates to /automotores/form/:dominio', () => {
      component.onEdit(mockAutomotores[0]);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/automotores/form', 'ABC123']);
    });
  });

  describe('onDelete', () => {
    function getConfirmationService() {
      return fixture.debugElement.injector.get(ConfirmationService);
    }

    it('calls facade.deleteAutomotor when confirmed', () => {
      const cs = getConfirmationService();
      spyOn(cs, 'confirm').and.callFake((config: any) => { config.accept(); return cs; });
      component.onDelete(mockAutomotores[0]);
      expect(mockFacade.deleteAutomotor).toHaveBeenCalledWith('ABC123');
    });

    it('shows success toast after deletion', () => {
      const cs = getConfirmationService();
      spyOn(cs, 'confirm').and.callFake((config: any) => { config.accept(); return cs; });
      component.onDelete(mockAutomotores[0]);
      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'success' })
      );
    });

    it('shows error toast when deletion fails', () => {
      mockFacade.deleteAutomotor.and.returnValue(
        throwError(() => ({ userMessage: 'No se pudo eliminar.' }))
      );
      const cs = getConfirmationService();
      spyOn(cs, 'confirm').and.callFake((config: any) => { config.accept(); return cs; });
      component.onDelete(mockAutomotores[0]);
      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' })
      );
    });
  });
});

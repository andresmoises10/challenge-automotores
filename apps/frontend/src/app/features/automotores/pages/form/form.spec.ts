import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

import { FormComponent } from './form';
import { AutomotoresFacadeService } from '../../services/automotores.facade.service';
import { SujetosApiService } from '../../../sujetos/services/sujetos-api.service';
import { Automotor } from '../../../../core/models';

const mockAutomotor: Automotor = {
  dominio: 'ABC123',
  chasis: 'CHS123ABC',
  motor: 'MOT456DEF',
  color: 'Blanco',
  fechaFabricacion: '202012',
  cuit: '30678901233',
  sujeto: { id: 1, cuit: '30678901233', nombre: 'Test SA', tipo: 'PERSONA_JURIDICA' },
};

// ---------------------------------------------------------------------------
// Create mode
// ---------------------------------------------------------------------------
describe('FormComponent (create mode)', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let facade: jasmine.SpyObj<AutomotoresFacadeService>;
  let router: jasmine.SpyObj<Router>;
  let msgService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    facade = jasmine.createSpyObj(
      'AutomotoresFacadeService',
      ['getAutomotorByDominio', 'createAutomotor', 'updateAutomotor'],
      { automotores: signal([]), loading: signal(false), error: signal(null) }
    );
    router = jasmine.createSpyObj('Router', ['navigate']);
    msgService = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [FormComponent],
      providers: [
        { provide: AutomotoresFacadeService, useValue: facade },
        { provide: SujetosApiService, useValue: jasmine.createSpyObj('SujetosApiService', ['createSujeto']) },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: (_: string) => null }) } },
        { provide: MessageService, useValue: msgService },
        provideNoopAnimations(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initializes all fields as empty strings', () => {
    expect(component.form.get('dominio')?.value).toBe('');
    expect(component.form.get('chasis')?.value).toBe('');
    expect(component.form.get('motor')?.value).toBe('');
    expect(component.form.get('color')?.value).toBe('');
    expect(component.form.get('fechaFabricacion')?.value).toBe('');
    expect(component.form.get('cuit')?.value).toBe('');
  });

  it('form is invalid when empty', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('isEditing() returns false', () => {
    expect(component.isEditing()).toBeFalse();
  });

  it('marks all as touched when submitting invalid form', () => {
    spyOn(component.form, 'markAllAsTouched');
    component.onSubmit();
    expect(component.form.markAllAsTouched).toHaveBeenCalled();
  });

  it('does not call createAutomotor when form is invalid', () => {
    component.onSubmit();
    expect(facade.createAutomotor).not.toHaveBeenCalled();
  });

  it('calls createAutomotor when form is valid', () => {
    facade.createAutomotor.and.returnValue(of(mockAutomotor));
    fillValidForm(component);
    component.onSubmit();
    expect(facade.createAutomotor).toHaveBeenCalled();
  });

  it('navigates to /automotores on create success', () => {
    facade.createAutomotor.and.returnValue(of(mockAutomotor));
    fillValidForm(component);
    component.onSubmit();
    expect(router.navigate).toHaveBeenCalledWith(['/automotores']);
  });

  it('strips hyphens from CUIT before submitting', () => {
    let capturedPayload: any;
    facade.createAutomotor.and.callFake((p: any) => { capturedPayload = p; return of(mockAutomotor); });
    fillValidForm(component);
    component.form.get('cuit')!.setValue('30-67890123-3');
    component.onSubmit();
    expect(capturedPayload).toBeDefined();
    expect(capturedPayload.cuit).toBe('30678901233');
  });

  it('sets field error on 422 with fieldErrors', () => {
    facade.createAutomotor.and.returnValue(
      throwError(() => ({
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        userMessage: 'Revisa los datos.',
        fieldErrors: { dominio: 'El dominio ya existe.' },
        status: 422,
      }))
    );
    fillValidForm(component);
    component.onSubmit();
    expect(component.form.get('dominio')?.errors?.['server']).toBe('El dominio ya existe.');
  });

  it('shows toast on generic error', () => {
    facade.createAutomotor.and.returnValue(
      throwError(() => ({
        code: 'INTERNAL_ERROR',
        message: 'Server error',
        userMessage: 'Error interno del servidor.',
        status: 500,
      }))
    );
    fillValidForm(component);
    component.onSubmit();
    expect(msgService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });

  it('opens sujeto dialog on SUJETO_NOT_FOUND', () => {
    facade.createAutomotor.and.returnValue(
      throwError(() => ({ code: 'SUJETO_NOT_FOUND', message: 'Not found', userMessage: 'No encontrado.', status: 400 }))
    );
    fillValidForm(component);
    component.onSubmit();
    expect(component.showSujetoDialog()).toBeTrue();
  });

  it('charCount returns 0 for empty field', () => {
    expect(component.charCount('chasis')).toBe(0);
  });

  it('charCount returns correct length', () => {
    component.form.get('chasis')?.setValue('ABC123');
    expect(component.charCount('chasis')).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// Edit mode
// ---------------------------------------------------------------------------
describe('FormComponent (edit mode)', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let editFacade: jasmine.SpyObj<AutomotoresFacadeService>;
  let editRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    editFacade = jasmine.createSpyObj(
      'AutomotoresFacadeService',
      ['getAutomotorByDominio', 'createAutomotor', 'updateAutomotor'],
      { automotores: signal([]), loading: signal(false), error: signal(null) }
    );
    editFacade.getAutomotorByDominio.and.returnValue(of(mockAutomotor));
    editFacade.updateAutomotor.and.returnValue(of(mockAutomotor));
    editRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FormComponent],
      providers: [
        { provide: AutomotoresFacadeService, useValue: editFacade },
        { provide: SujetosApiService, useValue: jasmine.createSpyObj('SujetosApiService', ['createSujeto']) },
        { provide: Router, useValue: editRouter },
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: (_: string) => 'ABC123' }) } },
        { provide: MessageService, useValue: jasmine.createSpyObj('MessageService', ['add']) },
        provideNoopAnimations(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('isEditing() returns true', () => {
    expect(component.isEditing()).toBeTrue();
  });

  it('disables dominio and cuit controls', () => {
    expect(component.form.get('dominio')?.disabled).toBeTrue();
    expect(component.form.get('cuit')?.disabled).toBeTrue();
  });

  it('loads automotor fields into form', () => {
    expect(editFacade.getAutomotorByDominio).toHaveBeenCalledWith('ABC123');
    expect(component.form.get('chasis')?.value).toBe('CHS123ABC');
    expect(component.form.get('color')?.value).toBe('Blanco');
  });

  it('calls updateAutomotor (not createAutomotor) on submit', () => {
    component.onSubmit();
    expect(editFacade.updateAutomotor).toHaveBeenCalled();
    expect(editFacade.createAutomotor).not.toHaveBeenCalled();
    expect(editRouter.navigate).toHaveBeenCalledWith(['/automotores']);
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fillValidForm(component: FormComponent, overrides: Record<string, string> = {}) {
  component.form.patchValue({
    dominio: 'ABC123',
    chasis: 'CHS123ABC',
    motor: 'MOT456DEF',
    color: 'Blanco',
    fechaFabricacion: '202012',
    cuit: '30678901233',
    ...overrides,
  });
}

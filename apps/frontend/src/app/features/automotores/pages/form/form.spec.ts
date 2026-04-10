import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { FormComponent } from './form';
import { AutomotoresFacadeService } from '../../services/automotores.facade.service';
import { SujetosFacadeService } from '../../../sujetos/services/sujetos.facade.service';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  const mockFacade = {
    loadAutomotores: jasmine.createSpy('loadAutomotores'),
    createAutomotor: jasmine.createSpy('createAutomotor').and.returnValue(of({})),
    updateAutomotor: jasmine.createSpy('updateAutomotor').and.returnValue(of({})),
  };

  const mockSujetosFacade = {};

  const mockRouter = { navigate: jasmine.createSpy('navigate') };

  const mockActivatedRoute = {
    paramMap: of({ get: (_: string) => null }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormComponent],
      providers: [
        { provide: AutomotoresFacadeService, useValue: mockFacade },
        { provide: SujetosFacadeService, useValue: mockSujetosFacade },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty fields', () => {
    expect(component.form).toBeDefined();
    expect(component.form.get('dominio')?.value).toBe('');
    expect(component.form.get('chasis')?.value).toBe('');
    expect(component.form.get('motor')?.value).toBe('');
    expect(component.form.get('color')?.value).toBe('');
    expect(component.form.get('fechaFabricacion')?.value).toBe('');
    expect(component.form.get('cuit')?.value).toBe('');
  });

  it('should be invalid when empty', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('should not be in editing mode when no dominio param', () => {
    expect(component.isEditing).toBeFalse();
  });
});

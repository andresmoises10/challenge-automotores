import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { finalize, switchMap } from 'rxjs/operators';

import { AutomotoresFacadeService } from '../../services/automotores.facade.service';
import { SujetosApiService } from '../../../sujetos/services/sujetos-api.service';
import { CreateAutomotorPayload } from '../../../../core/models';
import {
  cuitValidator,
  dominioValidator,
  fechaFabricacionValidator,
} from '../../../../shared/validators';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    SkeletonModule,
    DialogModule,
  ],
  providers: [],
  templateUrl: './form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private facade = inject(AutomotoresFacadeService);
  private sujetosApi = inject(SujetosApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  isEditing = signal(false);
  submitting = signal(false);

  // Modal alta de sujeto
  showSujetoDialog = signal(false);
  sujetoNombre = '';
  creandoSujeto = signal(false);
  private pendingPayload: CreateAutomotorPayload | null = null;

  ngOnInit() {
    this.initForm();
    this.checkIfEditing();
  }

  private initForm() {
    this.form = this.fb.group({
      dominio: ['', [Validators.required, dominioValidator()]],
      chasis: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(20),
          Validators.pattern(/^[A-Za-z0-9]+$/),
        ],
      ],
      motor: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(20),
          Validators.pattern(/^[A-Za-z0-9]+$/),
        ],
      ],
      color: ['', [Validators.required, Validators.maxLength(50)]],
      fechaFabricacion: ['', [Validators.required, fechaFabricacionValidator()]],
      cuit: ['', [Validators.required, cuitValidator()]],
    });
  }

  private checkIfEditing() {
    this.route.paramMap.subscribe((params) => {
      const dominio = params.get('dominio');
      if (dominio) {
        this.isEditing.set(true);
        this.form.get('dominio')?.disable();
        this.form.get('cuit')?.disable();
        this.loadAutomotor(dominio);
      }
    });
  }

  private loadAutomotor(dominio: string) {
    this.facade.getAutomotorByDominio(dominio).subscribe({
      next: (automotor) => {
        this.form.patchValue({
          dominio: automotor.dominio,
          chasis: automotor.chasis,
          motor: automotor.motor,
          color: automotor.color,
          fechaFabricacion: automotor.fechaFabricacion,
          cuit: automotor.sujeto?.cuit ?? automotor.cuit,
        });
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.userMessage || 'No se pudo cargar el automotor.',
          life: 5000,
        });
      },
    });
  }

  ctrl(name: string): AbstractControl {
    return this.form.get(name)!;
  }

  charCount(name: string): number {
    return this.ctrl(name).value?.length ?? 0;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    this.submitting.set(true);
    const formValue = this.form.getRawValue();
    formValue.cuit = formValue.cuit?.replace(/-/g, '');
    formValue.dominio = formValue.dominio?.toUpperCase().trim();

    this.pendingPayload = formValue;

    const operation = this.isEditing()
      ? this.facade.updateAutomotor(formValue.dominio, {
          chasis: formValue.chasis,
          motor: formValue.motor,
          color: formValue.color,
          fechaFabricacion: formValue.fechaFabricacion,
        })
      : this.facade.createAutomotor(formValue);

    operation
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: this.isEditing()
              ? 'Automotor actualizado correctamente.'
              : 'Automotor creado correctamente.',
            life: 3000,
          });
          this.router.navigate(['/automotores']);
        },
        error: (err: any) => {
          this.handleFormErrors(err);
        },
      });
  }

  private handleFormErrors(error: any) {
    if (error.code === 'SUJETO_NOT_FOUND') {
      this.sujetoNombre = '';
      this.showSujetoDialog.set(true);
      this.cdr.detectChanges();
      return;
    }

    if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
      Object.entries(error.fieldErrors).forEach(([field, message]) => {
        const control = this.form.get(field);
        if (control) {
          control.setErrors({ server: message as string });
          control.markAsTouched();
        }
      });

      const firstMessage = Object.values(error.fieldErrors)[0] as string;
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: firstMessage,
        life: 6000,
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.userMessage || 'No se pudo guardar el automotor.',
        life: 5000,
      });
    }
    this.cdr.detectChanges();
  }

  onCancel() {
    if (this.form.dirty) {
      if (confirm('¿Descartar cambios?')) {
        this.router.navigate(['/automotores']);
      }
    } else {
      this.router.navigate(['/automotores']);
    }
  }

  onSujetoDialogCancel() {
    this.showSujetoDialog.set(false);
    this.pendingPayload = null;
    this.submitting.set(false);
  }

  onSujetoDialogConfirm() {
    if (!this.sujetoNombre.trim() || !this.pendingPayload) return;

    this.creandoSujeto.set(true);

    this.sujetosApi
      .createSujeto({
        cuit: this.pendingPayload.cuit,
        nombre: this.sujetoNombre.trim(),
        tipo: 'PERSONA_FISICA',
      })
      .pipe(
        switchMap(() => this.facade.createAutomotor(this.pendingPayload!)),
        finalize(() => {
          this.creandoSujeto.set(false);
          this.submitting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.showSujetoDialog.set(false);
          this.pendingPayload = null;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Sujeto creado y automotor registrado correctamente.',
            life: 4000,
          });
          this.router.navigate(['/automotores']);
        },
        error: (err) => {
          this.showSujetoDialog.set(false);
          this.handleFormErrors(err);
        },
      });
  }
}

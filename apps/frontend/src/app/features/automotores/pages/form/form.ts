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
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { finalize } from 'rxjs/operators';

import { AutomotoresFacadeService } from '../../services/automotores.facade.service';
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
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CardModule,
    ToastModule,
    SkeletonModule,
  ],
  providers: [MessageService],
  templateUrl: './form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private facade = inject(AutomotoresFacadeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  isEditing = signal(false);
  submitting = signal(false);

  ngOnInit() {
    this.initForm();
    this.checkIfEditing();
  }

  private initForm() {
    this.form = this.fb.group({
      dominio: ['', [Validators.required, dominioValidator()]],
      chasis: ['', Validators.required],
      motor: ['', Validators.required],
      color: ['', Validators.required],
      fechaFabricacion: [
        '',
        [Validators.required, fechaFabricacionValidator()],
      ],
      cuit: ['', [Validators.required, cuitValidator()]],
    });
  }

  private checkIfEditing() {
    this.route.paramMap.subscribe((params) => {
      const dominio = params.get('dominio');
      if (dominio) {
        this.isEditing.set(true);
        this.form.get('dominio')?.disable();
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
          cuit: automotor.cuit,
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

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    this.submitting.set(true);
    const formValue = this.form.getRawValue();

    const operation = this.isEditing()
      ? this.facade.updateAutomotor(formValue.dominio, formValue)
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
    if (error.fieldErrors) {
      Object.entries(error.fieldErrors).forEach(([field, message]) => {
        const control = this.form.get(field);
        if (control) {
          control.setErrors({ server: message });
          control.markAsTouched();
        }
      });

      this.messageService.add({
        severity: 'error',
        summary: 'Validación',
        detail: 'Por favor revisa los campos marcados.',
        life: 5000,
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.userMessage || 'No se pudo guardar el automotor.',
        life: 5000,
      });
    }
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
}

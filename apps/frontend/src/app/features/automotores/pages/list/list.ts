import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

import { AutomotoresFacadeService } from '../../services/automotores.facade.service';
import { Automotor } from '../../../../core/models';

@Component({
  selector: 'app-automotores-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    TagModule,
    ConfirmDialogModule,
    SkeletonModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutomotolesListComponent implements OnInit {
  private facade = inject(AutomotoresFacadeService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  automotores = this.facade.automotores;
  loading = this.facade.loading;
  error = this.facade.error;

  ngOnInit(): void {
    this.facade.loadAutomotores();
  }

  onNew(): void {
    this.router.navigate(['/automotores/form']);
  }

  onEdit(automotor: Automotor): void {
    this.router.navigate(['/automotores/form', automotor.dominio]);
  }

  onDelete(automotor: Automotor): void {
    this.confirmationService.confirm({
      message: `¿Eliminar el automotor <strong>${automotor.dominio}</strong>?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.facade.deleteAutomotor(automotor.dominio).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: `Automotor ${automotor.dominio} eliminado.`,
              life: 3000,
            });
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.userMessage || 'No se pudo eliminar el automotor.',
              life: 5000,
            });
            this.cdr.markForCheck();
          },
        });
      },
    });
  }
}

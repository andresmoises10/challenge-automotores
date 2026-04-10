import { Injectable, inject, DestroyRef } from '@angular/core';
import { Observable, EMPTY } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  Automotor,
  ApiErrorInterface,
  CreateAutomotorPayload,
  UpdateAutomotorPayload,
} from '../../../core/models';
import { AutomotolesApiService } from './automotores.api.service';
import { AutomotoresStateService } from './automotores.state.service';

@Injectable({
  providedIn: 'root',
})
export class AutomotoresFacadeService {
  private api = inject(AutomotolesApiService);
  private state = inject(AutomotoresStateService);
  private destroyRef = inject(DestroyRef);

  // Public API
  automotores = this.state.automotores;
  loading = this.state.loading;
  error = this.state.error;
  filteredAutomotores = this.state.filteredAutomotores;

  loadAutomotores(page: number = 1, limit: number = 10): void {
    this.state.setLoading(true);
    this.state.setError(null);

    this.api
      .getAutomotores(page, limit)
      .pipe(
        tap((response) => {
          this.state.setAutomotores(response.data);
          this.state.setCurrentPage(page);
        }),
        catchError((error: ApiErrorInterface) => {
          this.state.setError(error);
          return EMPTY;
        }),
        finalize(() => this.state.setLoading(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  getAutomotorByDominio(dominio: string): Observable<Automotor> {
    return this.api.getAutomotorByDominio(dominio);
  }

  createAutomotor(payload: CreateAutomotorPayload): Observable<Automotor> {
    return this.api.createAutomotor(payload).pipe(
      tap((newAuto) => this.state.addAutomotor(newAuto)),
      catchError((error: ApiErrorInterface) => {
        this.state.setError(error);
        throw error;
      }),
    );
  }

  updateAutomotor(dominio: string, payload: UpdateAutomotorPayload): Observable<Automotor> {
    return this.api.updateAutomotor(dominio, payload).pipe(
      tap((updated) => this.state.updateAutomotor(updated)),
      catchError((error: ApiErrorInterface) => {
        this.state.setError(error);
        throw error;
      }),
    );
  }

  deleteAutomotor(dominio: string): Observable<void> {
    return this.api.deleteAutomotor(dominio).pipe(
      tap(() => this.state.removeAutomotor(dominio)),
      catchError((error: ApiErrorInterface) => {
        this.state.setError(error);
        throw error;
      }),
    );
  }

  setSearchTerm(term: string): void {
    this.state.setSearchTerm(term);
  }

  reset(): void {
    this.state.reset();
  }
}

import { Injectable, signal, computed } from '@angular/core';
import {ApiErrorInterface, Automotor} from '../../../core/models';


@Injectable({
  providedIn: 'root',
})
export class AutomotoresStateService {
  // Signals
  private automotoresSignal = signal<Automotor[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<ApiErrorInterface | null>(null);
  private searchTermSignal = signal('');
  private currentPageSignal = signal(1);

  // Readonly exports
  readonly automotores = this.automotoresSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly searchTerm = this.searchTermSignal.asReadonly();
  readonly currentPage = this.currentPageSignal.asReadonly();

  // Computed
  readonly filteredAutomotores = computed(() => {
    const autos = this.automotoresSignal();
    const term = this.searchTermSignal().toLowerCase();

    if (!term) return autos;

    return autos.filter(
      (auto) =>
        auto.dominio.toLowerCase().includes(term) ||
        auto.cuit.includes(term)
    );
  });

  // Setters
  setAutomotores(autos: Automotor[]) {
    this.automotoresSignal.set(autos);
  }

  setLoading(loading: boolean) {
    this.loadingSignal.set(loading);
  }

  setError(error: ApiErrorInterface | null) {
    this.errorSignal.set(error);
  }

  setSearchTerm(term: string) {
    this.searchTermSignal.set(term);
  }

  setCurrentPage(page: number) {
    this.currentPageSignal.set(page);
  }

  addAutomotor(auto: Automotor) {
    const current = this.automotoresSignal();
    this.automotoresSignal.set([auto, ...current]);
  }

  updateAutomotor(auto: Automotor) {
    const current = this.automotoresSignal();
    const updated = current.map((a) =>
      a.dominio === auto.dominio ? auto : a
    );
    this.automotoresSignal.set(updated);
  }

  removeAutomotor(dominio: string) {
    const current = this.automotoresSignal();
    const filtered = current.filter((a) => a.dominio !== dominio);
    this.automotoresSignal.set(filtered);
  }

  reset() {
    this.automotoresSignal.set([]);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
    this.searchTermSignal.set('');
    this.currentPageSignal.set(1);
  }
}

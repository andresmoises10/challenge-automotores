import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Automotor,
  CreateAutomotorPayload,
  UpdateAutomotorPayload,
  PaginatedAutomotores,
} from '../../../core/models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AutomotolesApiService {
  private readonly apiUrl = `${environment.apiUrl}/api/automotores`;

  constructor(private http: HttpClient) {}

  /** GET /api/automotores?page=1&limit=10 */
  getAutomotores(page: number = 1, limit: number = 10): Observable<PaginatedAutomotores> {
    return this.http.get<PaginatedAutomotores>(this.apiUrl, {
      params: { page, limit },
    });
  }

  /** GET /api/automotores/:dominio */
  getAutomotorByDominio(dominio: string): Observable<Automotor> {
    return this.http.get<Automotor>(`${this.apiUrl}/${dominio}`);
  }

  /** POST /api/automotores */
  createAutomotor(payload: CreateAutomotorPayload): Observable<Automotor> {
    return this.http.post<Automotor>(this.apiUrl, payload);
  }

  /** PUT /api/automotores/:dominio */
  updateAutomotor(dominio: string, payload: UpdateAutomotorPayload): Observable<Automotor> {
    return this.http.put<Automotor>(`${this.apiUrl}/${dominio}`, payload);
  }

  /** DELETE /api/automotores/:dominio */
  deleteAutomotor(dominio: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${dominio}`);
  }
}

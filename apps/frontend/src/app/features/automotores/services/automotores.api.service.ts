import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Automotor } from '../../../core/models';

@Injectable({
  providedIn: 'root',
})
export class AutomotolesApiService {
  private apiUrl = '/api/automotores';

  constructor(private http: HttpClient) {}

  getAutomotores(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(this.apiUrl, {
      params: { page, limit },
    });
  }

  getAutomotorByDominio(dominio: string): Observable<Automotor> {
    return this.http.get<Automotor>(`${this.apiUrl}/${dominio}`);
  }

  createAutomotor(automotor: Partial<Automotor>): Observable<Automotor> {
    return this.http.post<Automotor>(this.apiUrl, automotor);
  }

  updateAutomotor(dominio: string, automotor: Partial<Automotor>): Observable<Automotor> {
    return this.http.put<Automotor>(`${this.apiUrl}/${dominio}`, automotor);
  }

  deleteAutomotor(dominio: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${dominio}`);
  }
}

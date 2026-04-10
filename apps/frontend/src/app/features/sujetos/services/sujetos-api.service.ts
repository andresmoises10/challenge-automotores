import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sujeto, CreateSujetoPayload } from '../../../core/models';

@Injectable({
  providedIn: 'root',
})
export class SujetosApiService {
  private readonly apiUrl = '/api/sujetos';

  constructor(private http: HttpClient) {}

  /** GET /api/sujetos/by-cuit?cuit=20123456789 */
  getSujetoByCuit(cuit: string): Observable<Sujeto> {
    return this.http.get<Sujeto>(`${this.apiUrl}/by-cuit`, {
      params: { cuit },
    });
  }

  /** POST /api/sujetos */
  createSujeto(payload: CreateSujetoPayload): Observable<Sujeto> {
    return this.http.post<Sujeto>(this.apiUrl, payload);
  }
}

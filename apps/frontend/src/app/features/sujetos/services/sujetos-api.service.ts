import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sujeto } from '../../../core/models';

@Injectable({
  providedIn: 'root',
})
export class SujetosApiService {
  private apiUrl = '/api/sujetos';

  constructor(private http: HttpClient) {}

  getSujetosByCuit(cuit: string): Observable<Sujeto> {
    return this.http.get<Sujeto>(`${this.apiUrl}/by-cuit`, {
      params: { cuit },
    });
  }

  createSujeto(sujeto: Partial<Sujeto>): Observable<Sujeto> {
    return this.http.post<Sujeto>(this.apiUrl, sujeto);
  }
}

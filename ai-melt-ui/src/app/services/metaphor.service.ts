// src/app/services/metaphor.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Metaphor } from '../models/metaphor.model';
import { ProcessBatchRequest, MetaphorOut } from '../models/metaphor-api.model'; 
// (ver comentarios más abajo sobre este archivo “metaphor-api.model.ts”)

@Injectable({
  providedIn: 'root'
})
export class MetaphorService {
  private baseUrl = 'http://localhost:8000';  // <-- Ajusta según tu URL del backend

  constructor(private http: HttpClient) {}

  /**
   * Llama al endpoint POST /metaphor/process_batch
   * Recibe un objeto ProcessBatchRequest y devuelve un arreglo de MetaphorOut
   */
  processBatch(requestBody: ProcessBatchRequest): Observable<MetaphorOut[]> {
    const url = `${this.baseUrl}/metaphor/process_batch`;
    return this.http
      .post<MetaphorOut[]>(url, requestBody)
      .pipe(catchError(this.handleError));
  }

  private handleError(err: HttpErrorResponse) {
    console.error('[MetaphorService] Error en la petición:', err);
    return throwError(() => err);
  }
}

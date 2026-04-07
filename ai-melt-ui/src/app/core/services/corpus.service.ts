import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { Corpus, CreateCorpusPayload } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CorpusService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Corpus[]>(`${environment.apiUrl}/corpus`);
  }

  getOne(id: string) {
    return this.http.get<Corpus>(`${environment.apiUrl}/corpus/${id}`);
  }

  create(payload: CreateCorpusPayload) {
    return this.http.post<Corpus>(`${environment.apiUrl}/corpus`, payload);
  }

  update(id: string, payload: Partial<CreateCorpusPayload>) {
    return this.http.put<Corpus>(`${environment.apiUrl}/corpus/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<Corpus>(`${environment.apiUrl}/corpus/${id}`);
  }
}

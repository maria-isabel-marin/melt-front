import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { Document, DocumentSummary, CreateDocumentPayload, Analysis } from '../models/models';
import type { AiProvider } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  constructor(private http: HttpClient) {}

  getByCorpus(corpusId: string) {
    return this.http.get<DocumentSummary[]>(`${environment.apiUrl}/documentos`, {
      params: { corpusId },
    });
  }

  getOne(id: string) {
    return this.http.get<Document>(`${environment.apiUrl}/documentos/${id}`);
  }

  create(payload: CreateDocumentPayload) {
    return this.http.post<Document>(`${environment.apiUrl}/documentos`, payload);
  }

  delete(id: string) {
    return this.http.delete<Document>(`${environment.apiUrl}/documentos/${id}`);
  }

  initAnalysis(documentId: string, aiProvider: AiProvider = 'CLAUDE') {
    return this.http.post<Analysis>(`${environment.apiUrl}/documentos/${documentId}/analisis`, {
      aiProvider,
    });
  }
}

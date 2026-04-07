import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type {
  Analysis,
  PrimaryMetaphor,
  ConventionalMetaphor,
  MetaphoricalScenario,
  MetaphorRegime,
  CulturalNarrative,
  ItemStatus,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  constructor(private http: HttpClient) {}

  getAnalysis(analysisId: string) {
    return this.http.get<Analysis>(`${environment.apiUrl}/analisis/${analysisId}`);
  }

  // ── Level processing ──────────────────────────────────────────────────────

  processLevel(analysisId: string, level: 1 | 2 | 3 | 4 | 5) {
    return this.http.post<any>(`${environment.apiUrl}/analisis/${analysisId}/nivel/${level}/process`, {});
  }

  // ── Level results ─────────────────────────────────────────────────────────

  getLevel1(analysisId: string) {
    return this.http.get<PrimaryMetaphor[]>(`${environment.apiUrl}/analisis/${analysisId}/nivel/1`);
  }

  getLevel2(analysisId: string) {
    return this.http.get<ConventionalMetaphor[]>(`${environment.apiUrl}/analisis/${analysisId}/nivel/2`);
  }

  getLevel3(analysisId: string) {
    return this.http.get<MetaphoricalScenario[]>(`${environment.apiUrl}/analisis/${analysisId}/nivel/3`);
  }

  getLevel4(analysisId: string) {
    return this.http.get<MetaphorRegime[]>(`${environment.apiUrl}/analisis/${analysisId}/nivel/4`);
  }

  getLevel5(analysisId: string) {
    return this.http.get<CulturalNarrative>(`${environment.apiUrl}/analisis/${analysisId}/nivel/5`);
  }

  // ── Approval ──────────────────────────────────────────────────────────────

  approveLevel(analysisId: string, level: 1 | 2 | 3 | 4 | 5) {
    return this.http.post<Analysis>(`${environment.apiUrl}/analisis/${analysisId}/nivel/${level}/approve`, {});
  }

  approveAllItems(analysisId: string, level: 1 | 2 | 3 | 4 | 5) {
    return this.http.post<Analysis>(`${environment.apiUrl}/analisis/${analysisId}/nivel/${level}/approve-all`, {});
  }

  updateItemStatus(model: string, itemId: string, status: ItemStatus, analystNote?: string) {
    return this.http.patch<any>(`${environment.apiUrl}/analisis/items/${model}/${itemId}/status`, {
      status,
      analystNote,
    });
  }
}

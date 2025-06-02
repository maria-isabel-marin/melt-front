import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UploadResult {
  batches: string[];
  promptTokens: number;
}

/**
 * StageService mantiene el estado actual de “etapa” del flujo MELT.
 * Cuando DocumentUploadComponent finaliza sin error, invocará setStage("metaphor-identification"),
 * de modo que DashboardComponent resalte el enlace de “Detect & Classify Metaphors”.
 */
@Injectable({ providedIn: 'root' })
export class StageService {
  private currentStageSubject = new BehaviorSubject<string>('document-upload');
  currentStage$ = this.currentStageSubject.asObservable();

  private dataSubject = new BehaviorSubject<UploadResult | null>(null);
  data$ = this.dataSubject.asObservable();

  setStage(stage: string) {
    this.currentStageSubject.next(stage);
  }

  setData(data: UploadResult) {
    this.dataSubject.next(data);
  }
}

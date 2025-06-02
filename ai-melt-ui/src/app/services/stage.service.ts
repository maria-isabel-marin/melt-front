// src/app/services/stage.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MetaphorRecord {
  expression: string;
  sourceDomain: string;
  targetDomain: string;
  conceptualMetaphor: string;
  type: string;
  confirmed: boolean;
}

export interface UploadResult {
  batches: string[];
  promptTokens: number;
}

@Injectable({
  providedIn: 'root'
})
export class StageService {
  /** 1) CODE: generado en DocumentUpload (ej. "123AB") */
  private processingCode = '';

  /** 2) LISTA GLOBAL de metáforas confirmadas hasta el momento */
  private confirmedMetaphors: MetaphorRecord[] = [];

  /** 3) Current stage: para controlar qué menú iluminar */
  private currentStageSubject = new BehaviorSubject<string>('document-upload');
  currentStage$ = this.currentStageSubject.asObservable();

  private dataSubject = new BehaviorSubject<UploadResult | null>(null);
  data$ = this.dataSubject.asObservable();

  private allBatches: string[] = [];

  constructor() { }

  /** Genera y almacena un código de 3 dígitos + 2 letras */
  public generateProcessingCode(): string {
    // Ejemplo de generación simple:
    const digits = Math.floor(100 + Math.random() * 900); // 100–999
    const letters = String.fromCharCode(
      65 + Math.floor(Math.random() * 26),
      65 + Math.floor(Math.random() * 26)
    ); // Dos letras mayúsculas
    this.processingCode = `${digits}${letters}`;
    return this.processingCode;
  }

  /** Recupera el código actual */
  public getProcessingCode(): string {
    return this.processingCode;
  }

  /** NOTIFICA cambio de etapa al Dashboard */
  public setStage(stage: string): void {
    this.currentStageSubject.next(stage);
  }

  setData(data: UploadResult) {
    this.dataSubject.next(data);
  }

  /** Agrega un conjunto de metáforas confirmadas */
  public addConfirmedMetaphors(newRecords: MetaphorRecord[]): void {
    this.confirmedMetaphors.push(...newRecords);
  }

  /** Obtiene TODAS las metáforas confirmadas hasta ahora */
  public getAllConfirmedMetaphors(): MetaphorRecord[] {
    return this.confirmedMetaphors;
  }

  /** Limpia la lista global (opcional, para reiniciar flujo) */
  public clearConfirmedMetaphors(): void {
    this.confirmedMetaphors = [];
  }

  public setAllBatches(batches: string[]): void {
    this.allBatches = batches;
  }

  public getBatchesArray(): string[] {
    return this.allBatches;
  }
}


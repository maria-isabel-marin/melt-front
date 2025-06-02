import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs';
import { Metaphor } from '../models/metaphor.model';


@Injectable({
  providedIn: 'root'
})
export class StageService {
  /** 
   * El “processingCode” de 3 dígitos + 2 letras. 
   * Se genera en DocumentUpload y se comparte con todas las etapas.
   */
  private processingCodeSubject = new BehaviorSubject<string>('');
  processingCode$ = this.processingCodeSubject.asObservable();

  /** Etapa actual del pipeline (“document-upload”, “metaphor-identification”, etc.). */
  private currentStageSubject = new BehaviorSubject<string>('document-upload');
  currentStage$ = this.currentStageSubject.asObservable();


  /** Lista global de batches */
  private batches: string[] = [];
  private promptTokens: number = 100;


  /** Lista global de metáforas confirmadas (que se van acumulando batch tras batch). */
  private confirmedMetaphors: Metaphor[] = [];

  constructor() {}

  /** Genera aleatoriamente 3 dígitos + 2 letras y emite. */
  generateProcessingCode() {
    // Ejemplo: “382AZ”
    const digits = Math.floor(100 + Math.random() * 900).toString(); // 3 dígitos, sin ceros iniciales
    const letters = Array.from({ length: 2 }, () => {
      const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return A.charAt(Math.floor(Math.random() * 26));
    }).join('');
    const code = `${digits}${letters}`;
    this.processingCodeSubject.next(code);
    return code;
  }

  /** Permite asignar manualmente (en tests, si se desea). */
  setProcessingCode(code: string) {
    this.processingCodeSubject.next(code);
  }

  /** Devuelve el último processingCode (valor inmediato, no Observable). */
  getProcessingCode(): string {
    return this.processingCodeSubject.getValue();
  }

  /** Cambia la etapa actual y emite. */
  setStage(stage: string) {
    this.currentStageSubject.next(stage);
  }

  /** 
   * Añade al array global las metáforas que llegan confirmadas de un batch. 
   * Se evita duplicados en base a “expression” (si ya existe, no lo añade).
   * TODO: cambiar lógica, se requiere otro criterio de unicidad ya que puede 
   * haber dos expresiones iguales en distintos lugares del documento.
   */
  appendConfirmed(metas: Metaphor[]) {
    metas.forEach(m => {
      this.confirmedMetaphors.push(m);
      /*if (!this.confirmedMetaphors.some(existing => existing.expression === m.expression)) {
        this.confirmedMetaphors.push(m);
      }*/
    });
  }

  /** Limpia la lista global (opcional, para reiniciar flujo) */
  public clearConfirmedMetaphors(): void {
    this.confirmedMetaphors = [];
  }

  public getConfirmedMetaphors(): Metaphor[] {
    return this.confirmedMetaphors; 
  }

  /** Devuelve el array de batches (en MetaphorIdentification lo consumimos). */
  getBatches(): string[] {
    return [...this.batches];
  }

  /** DocumentUpload llamará a este método para guardar el array de batches en el servicio. */
  setBatches(batches: string[]) {
    this.batches = [...batches];
  }

  /** 
   * Añade un nuevo batch a la lista global. 
   * Se usa para ir acumulando los batches procesados.
   */

  public addBatch(batch: string): void {
    this.batches.push(batch);
  }

  /** 
   * Limpia la lista de batches procesados. 
   * Se usa para reiniciar el flujo si es necesario.
   */  

  public clearBatches(): void {
    this.batches = [];
  }

  /** DocumentUpload guardará el valor del promptTokens (número de tokens por prompt). */
  setPromptTokens(n: number) {
    this.promptTokens = n;
  }

  /** Devuelve el promptTokens actual */
  getPromptTokens(): number {
    return this.promptTokens;
  }

  /** 
   * Devuelve el estado actual del pipeline (etapa y código de procesamiento).
   * Útil para mostrar en la UI o para depuración.
   */
  public getPipelineState(): { stage: string; processingCode: string } {
    return {
      stage: this.currentStageSubject.getValue(),
      processingCode: this.processingCodeSubject.getValue()
    };
    }


}

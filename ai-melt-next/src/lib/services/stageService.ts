import { Metaphor } from './metaphorService';

class StageService {
  private processingCode: string = '';
  private currentStage: string = 'document-upload';
  private batches: string[] = [];
  private promptTokens: number = 100;
  private confirmedMetaphors: Metaphor[] = [];

  // Event listeners para cambios de estado
  private listeners: {
    processingCode?: (code: string) => void;
    currentStage?: (stage: string) => void;
    confirmedMetaphors?: (metaphors: Metaphor[]) => void;
  } = {};

  /**
   * Genera aleatoriamente 3 dígitos + 2 letras y emite.
   */
  generateProcessingCode(): string {
    const digits = Math.floor(100 + Math.random() * 900).toString();
    const letters = Array.from({ length: 2 }, () => {
      const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return A.charAt(Math.floor(Math.random() * 26));
    }).join('');
    const code = `${digits}${letters}`;
    this.processingCode = code;
    this.notifyListeners('processingCode', code);
    return code;
  }

  /**
   * Permite asignar manualmente (en tests, si se desea).
   */
  setProcessingCode(code: string): void {
    this.processingCode = code;
    this.notifyListeners('processingCode', code);
  }

  /**
   * Devuelve el último processingCode (valor inmediato).
   */
  getProcessingCode(): string {
    return this.processingCode;
  }

  /**
   * Cambia la etapa actual y emite.
   */
  setStage(stage: string): void {
    this.currentStage = stage;
    this.notifyListeners('currentStage', stage);
  }

  /**
   * Obtiene la etapa actual.
   */
  getCurrentStage(): string {
    return this.currentStage;
  }

  /**
   * Añade al array global las metáforas que llegan confirmadas de un batch.
   */
  appendConfirmed(metas: Metaphor[]): void {
    metas.forEach(m => {
      this.confirmedMetaphors.push(m);
    });
    this.notifyListeners('confirmedMetaphors', this.confirmedMetaphors);
  }

  /**
   * Limpia la lista global (opcional, para reiniciar flujo).
   */
  clearConfirmedMetaphors(): void {
    this.confirmedMetaphors = [];
    this.notifyListeners('confirmedMetaphors', this.confirmedMetaphors);
  }

  /**
   * Obtiene las metáforas confirmadas.
   */
  getConfirmedMetaphors(): Metaphor[] {
    return [...this.confirmedMetaphors];
  }

  /**
   * Devuelve el array de batches.
   */
  getBatches(): string[] {
    return [...this.batches];
  }

  /**
   * DocumentUpload llamará a este método para guardar el array de batches en el servicio.
   */
  setBatches(batches: string[]): void {
    this.batches = [...batches];
  }

  /**
   * Añade un nuevo batch a la lista global.
   */
  addBatch(batch: string): void {
    this.batches.push(batch);
  }

  /**
   * Limpia la lista de batches procesados.
   */
  clearBatches(): void {
    this.batches = [];
  }

  /**
   * DocumentUpload guardará el valor del promptTokens (número de tokens por prompt).
   */
  setPromptTokens(n: number): void {
    this.promptTokens = n;
  }

  /**
   * Devuelve el promptTokens actual.
   */
  getPromptTokens(): number {
    return this.promptTokens;
  }

  /**
   * Devuelve el estado actual del pipeline (etapa y código de procesamiento).
   */
  getPipelineState(): { stage: string; processingCode: string } {
    return {
      stage: this.currentStage,
      processingCode: this.processingCode
    };
  }

  /**
   * Suscribirse a cambios de estado.
   */
  subscribe(event: keyof typeof this.listeners, callback: any): () => void {
    this.listeners[event] = callback;
    return () => {
      delete this.listeners[event];
    };
  }

  /**
   * Notificar a los listeners sobre cambios.
   */
  private notifyListeners(event: keyof typeof this.listeners, data: any): void {
    const listener = this.listeners[event];
    if (listener) {
      listener(data);
    }
  }
}

// Exportar una instancia singleton
export const stageService = new StageService(); 
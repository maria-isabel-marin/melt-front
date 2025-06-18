import axios from 'axios';
import { API_CONFIG, buildApiUrl } from '../config/api';

// Tipos basados en los modelos de Angular
export interface ProcessBatchRequest {
  processing_code: string;
  batch_index: number;
  batch_text: string;
  prompt_tokens: number;
}

export interface MetaphorOut {
  _id: string | null;
  expression: string;
  sourceDomain: string;
  targetDomain: string;
  conceptualMetaphor: string;
  type: string;
  confirmed: boolean;
}

export interface Metaphor {
  expression: string;
  sourceDomain: string;
  targetDomain: string;
  conceptualMetaphor: string;
  type: string;
  confirmed: boolean;
}

class MetaphorService {
  /**
   * Llama al endpoint POST /metaphor/process_batch
   * Recibe un objeto ProcessBatchRequest y devuelve un arreglo de MetaphorOut
   */
  async processBatch(requestBody: ProcessBatchRequest): Promise<MetaphorOut[]> {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.METAPHOR_PROCESS_BATCH);
      
      const response = await axios.post<MetaphorOut[]>(url, requestBody, {
        timeout: API_CONFIG.TIMEOUT,
        headers: API_CONFIG.DEFAULT_HEADERS,
      });
      
      return response.data;
    } catch (error) {
      console.error('[MetaphorService] Error en la petición:', error);
      throw error;
    }
  }

  /**
   * Método para manejar errores de manera consistente
   */
  private handleError(error: any) {
    console.error('[MetaphorService] Error:', error);
    throw error;
  }
}

// Exportar una instancia singleton
export const metaphorService = new MetaphorService(); 
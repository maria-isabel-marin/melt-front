// src/app/models/metaphor-api.model.ts

/**
 * Scheme para lo que enviamos al backend al procesar un batch
 */
export interface ProcessBatchRequest {
  processing_code: string;
  batch_index: number;
  batch_text: string;
  prompt_tokens: number;
}

/**
 * Scheme para la respuesta que devuelve el backend (MetaphorOut)
 * Ajusta nombres de propiedades si difieren en tu Pydantic schema.
 */
export interface MetaphorOut {
  _id: string | null;          // backend envía "" o string
  expression: string;
  sourceDomain: string;
  targetDomain: string;
  conceptualMetaphor: string;
  type: string;
  confirmed: boolean;
}

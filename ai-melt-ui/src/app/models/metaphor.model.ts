/** 
 * Cada metáfora devuelta por el backend tendrá estas propiedades básicas.
 * Agregamos `confirmed` para marcarla como “aceptada”.
 */
export interface Metaphor {
  expression: string;       // Expresión metafórica
  sourceDomain: string;     // Dominio fuente
  targetDomain: string;     // Dominio meta
  conceptualMetaphor: string; // Metáfora conceptual
  type: string;             // Tipo (“conventional” o “novel”, etc.)
  confirmed: boolean;       // Nuestro campo adicional, inicia en false
}

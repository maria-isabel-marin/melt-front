// src/lib/config/api.ts

export const API_CONFIG = {
  // URL base del backend - ajusta según tu configuración
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  
  // Endpoints
  ENDPOINTS: {
    METAPHOR_PROCESS_BATCH: '/metaphor/process_batch',
  },
  
  // Configuración de timeout para las peticiones
  TIMEOUT: 30000, // 30 segundos
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}; 
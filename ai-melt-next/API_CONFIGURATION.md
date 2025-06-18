# API Configuration

## Backend URL Configuration

Para configurar la URL del backend, crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Endpoints

La aplicación Next.js está configurada para comunicarse con los siguientes endpoints del backend:

### Metaphor Processing
- **Endpoint**: `POST /metaphor/process_batch`
- **URL completa**: `http://localhost:8000/metaphor/process_batch`
- **Descripción**: Procesa un batch de texto para identificar metáforas

### Request Body (ProcessBatchRequest)
```typescript
{
  processing_code: string;    // Código de procesamiento (ej: "382AZ")
  batch_index: number;        // Índice del batch (0-based)
  batch_text: string;         // Texto del batch a procesar
  prompt_tokens: number;      // Número de tokens por prompt
}
```

### Response (MetaphorOut[])
```typescript
{
  _id: string | null;         // ID de la metáfora (backend envía "" o string)
  expression: string;         // Expresión metafórica
  sourceDomain: string;       // Dominio fuente
  targetDomain: string;       // Dominio meta
  conceptualMetaphor: string; // Metáfora conceptual
  type: string;               // Tipo ("conventional" o "novel", etc.)
  confirmed: boolean;         // Estado de confirmación
}[]
```

## Servicios Implementados

### MetaphorService
- **Archivo**: `src/lib/services/metaphorService.ts`
- **Métodos**:
  - `processBatch(requestBody: ProcessBatchRequest): Promise<MetaphorOut[]>`

### StageService
- **Archivo**: `src/lib/services/stageService.ts`
- **Funcionalidad**: Manejo del estado global de la aplicación
- **Características**:
  - Generación de códigos de procesamiento
  - Gestión de batches
  - Estado de metáforas confirmadas
  - Navegación entre etapas

## Configuración de Desarrollo

1. Asegúrate de que el backend esté ejecutándose en `http://localhost:8000`
2. Crea el archivo `.env.local` con la URL correcta
3. Ejecuta `npm run dev` para iniciar la aplicación Next.js

## Estructura de Archivos

```
src/
├── lib/
│   ├── config/
│   │   └── api.ts              # Configuración centralizada de la API
│   ├── services/
│   │   ├── metaphorService.ts  # Servicio para procesamiento de metáforas
│   │   └── stageService.ts     # Servicio de estado global
│   └── hooks/
│       └── useStageService.ts  # Hook para usar StageService en React
└── app/
    ├── document-upload/        # Página de carga de documentos
    └── metaphor-identification/ # Página de identificación de metáforas
``` 
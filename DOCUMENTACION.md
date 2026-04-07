# MELT — Documentación técnica base

**Metaphor Extraction & Language Toolkit**
Pipeline de análisis metafórico asistido por IA, basado en los frameworks MIPVU, Musolff y Valdivia.

---

## Repositorios

| Repo | Rama principal | URL |
|---|---|---|
| `melt-back` | `main` | github.com/maria-isabel-marin/melt-back |
| `melt-front` | `claude/analyze-project-structure-LdkGf` | github.com/maria-isabel-marin/melt-front |

> El frontend vive dentro de `melt-front/ai-melt-next/`. La carpeta `ai-melt-ui/` es un proyecto Angular anterior que **no se usa**.

---

## Stack

### Backend — `melt-back`

| Tecnología | Versión | Rol |
|---|---|---|
| NestJS | ^11 | Framework principal |
| TypeScript | ^5 | Lenguaje |
| Prisma ORM | ^7.6 | Acceso a base de datos |
| PostgreSQL | — | Base de datos |
| Passport.js | ^0.7 | Autenticación (Google OAuth + JWT) |
| `@nestjs/jwt` | ^11 | Generación y verificación de JWT |
| `@anthropic-ai/sdk` | ^0.82 | Proveedor IA principal (Claude) |
| `openai` | ^6 | Proveedor IA alternativo |

**Módulos NestJS:**
- `AuthModule` — Google OAuth 2.0 + sesiones de invitado + JWT
- `CorpusModule` — CRUD de corpus
- `DocumentosModule` — CRUD de documentos + inicialización de análisis
- `AnalisisModule` — Pipeline de análisis por niveles (1–5)
- `AiModule` — Servicio compartido de llamadas a Claude/OpenAI

### Frontend — `melt-front/ai-melt-next`

| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 15.5.14 | Framework (App Router) |
| React | 19.1.0 | UI |
| TypeScript | ^5 | Lenguaje |
| Tailwind CSS | ^4 | Estilos (config basada en CSS, sin `tailwind.config.ts`) |
| Radix UI | varios | Primitivos de accesibilidad |
| Lucide React | ^1.7 | Iconos |
| clsx + tailwind-merge | — | Utilidades de clases CSS |

> Los componentes siguen la API de **shadcn/ui** pero están escritos a mano (el CLI de shadcn requiere acceso a red en el momento de la instalación y no estaba disponible).

---

## Variables de entorno

### `melt-back/.env`

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/melt_back?schema=public"

JWT_SECRET="string-secreto-largo"
JWT_EXPIRES_IN="7d"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"

ANTHROPIC_API_KEY="sk-ant-..."
CLAUDE_MODEL="claude-opus-4-6"

OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o"

FRONTEND_URL="http://localhost:3001"
PORT=3000
```

### `melt-front/ai-melt-next/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Puertos en desarrollo local

| Servicio | Puerto |
|---|---|
| melt-back (NestJS) | 3000 |
| melt-front (Next.js) | 3001 |

El backend tiene CORS configurado para aceptar solo `FRONTEND_URL`. Si se cambia el puerto del frontend, hay que actualizar esa variable.

---

## Comandos para correr en local

```bash
# Backend
cd melt-back
npm install
npx prisma generate
npx prisma db push       # crea tablas en la DB
npm run start:dev        # http://localhost:3000/api

# Frontend (otra terminal)
cd melt-front/ai-melt-next
npm install
npm run dev -- -p 3001   # http://localhost:3001
```

---

## Flujo de la aplicación

```
/ (Login)
├── Google OAuth  →  /api/auth/google  →  Google  →  /api/auth/google/callback
│                    backend genera JWT  →  redirect a /auth/callback?token=JWT
│                    frontend guarda JWT en localStorage  →  /corpus
│
└── Continue as Guest  →  POST /api/auth/guest  →  {token}
                          frontend guarda JWT en localStorage  →  /corpus
```

```
/corpus                         Lista de corpus del usuario
  └── /corpus/[id]              Documentos del corpus
        └── /corpus/[id]/document/[docId]    Análisis del documento (6 tabs)
```

### Autenticación

- El backend maneja todo el flujo OAuth (Google). El frontend solo recibe el JWT por URL.
- JWT almacenado en `localStorage` bajo la clave `melt_token`.
- Todas las llamadas al API incluyen `Authorization: Bearer <token>` automáticamente (ver `src/lib/api.ts`).
- Las sesiones de invitado son temporales. Al hacer logout, el usuario invitado se elimina de la DB.
- No se usa NextAuth. El middleware de Next.js es mínimo (el token está en localStorage, no accesible en el servidor).

---

## Pipeline de análisis MELT

El análisis de un documento tiene **6 niveles**. Cada nivel tiene un `LevelStatus` independiente.

### Estados de nivel (`LevelStatus`)

| Estado | Significado |
|---|---|
| `PENDING` | No iniciado |
| `PROCESSING` | IA trabajando (proceso asíncrono) |
| `PENDING_REVIEW` | IA terminó, esperando revisión del analista |
| `APPROVED` | Analista aprobó el nivel completo |
| `OUTDATED` | Un nivel anterior fue modificado, este debe reprocesarse |

### Estados de ítem (`ItemStatus`)

Cada elemento individual dentro de un nivel (una metáfora, un escenario, etc.) tiene su propio estado:

| Estado | Significado |
|---|---|
| `PENDING_REVIEW` | Pendiente de revisión |
| `APPROVED` | Aprobado por el analista |
| `REJECTED` | Rechazado |
| `MODIFIED` | Modificado manualmente |

### Los 6 niveles

| Nivel | Nombre | Contenido principal |
|---|---|---|
| 0 | Summary | Metadatos del documento. Se aprueba automáticamente al crear el análisis. |
| 1 | Primary Metaphors | Expresiones metafóricas individuales identificadas en el texto. Incluye mappings ontológicos y epistémicos. |
| 2 | Conventional Metaphors | Agrupaciones de metáforas primarias por dominio conceptual. Incluye frecuencia y robustez. |
| 3 | Metaphorical Scenarios | Escenarios construidos a partir de metáforas convencionales. Incluye grupos sociales, secuencia narrativa, sesgo evaluativo y afectos. |
| 4 | Metaphor Regimes | Agrupaciones de escenarios en regímenes dominantes. Incluye metáforas derivadas y ejes de valor. |
| 5 | Cultural Narrative | Síntesis narrativa cultural derivada de un régimen. |

### Flujo de un nivel

```
PENDING  →  [usuario pulsa "Process with AI"]
         →  PROCESSING  (la IA genera los datos)
         →  PENDING_REVIEW  (datos listos para revisión)
              ├── El analista revisa ítem por ítem (Approve / Reject por item)
              ├── "Approve All Items" → aprueba todos los ítems del nivel
              └── "Approve Level" → marca el nivel como APPROVED y activa el siguiente
```

Si se modifica un nivel ya aprobado, los niveles posteriores pasan a `OUTDATED`.

---

## Estructura de archivos relevantes

### Backend (`melt-back/src/`)

```
modules/
├── auth/
│   ├── auth.controller.ts     GET /auth/google, POST /auth/guest, GET /auth/me
│   ├── auth.service.ts        createGuestUser, signToken, deleteGuestUser
│   └── strategies/            google.strategy.ts, jwt.strategy.ts
├── corpus/
│   ├── corpus.controller.ts   CRUD /corpus
│   └── corpus.service.ts
├── documentos/
│   ├── documentos.controller.ts  CRUD /documentos, POST /documentos/:id/analisis
│   └── documentos.service.ts
└── analisis/
    ├── analisis.controller.ts    GET/POST /analisis/:id/nivel/:n, PATCH items
    ├── analisis.service.ts       approveNivel, approveAll, updateItemStatus
    └── niveles/
        ├── nivel1.service.ts     Generación de metáforas primarias con IA
        ├── nivel2.service.ts     Generación de metáforas convencionales
        ├── nivel3.service.ts     Generación de escenarios metafóricos
        ├── nivel4.service.ts     Generación de regímenes
        └── nivel5.service.ts     Generación de narrativa cultural
```

### Frontend (`melt-front/ai-melt-next/src/`)

```
app/
├── page.tsx                          /  →  Login
├── auth/callback/page.tsx            /auth/callback  →  extrae JWT de URL
├── layout.tsx                        Root layout (html/body)
└── (app)/                            Route group: páginas autenticadas (con sidebar)
    ├── layout.tsx                    Verifica isLoggedIn(), muestra Sidebar
    └── corpus/
        ├── page.tsx                  /corpus  →  lista de corpus
        └── [id]/
            ├── page.tsx              /corpus/[id]  →  documentos del corpus
            └── document/[docId]/
                └── page.tsx          /corpus/[id]/document/[docId]  →  análisis

components/
├── shell/
│   └── Sidebar.tsx                   Navegación lateral (azul oscuro)
├── ui/                               Componentes base estilo shadcn/ui
│   ├── button.tsx                    Button (variants: default, outline, ghost, destructive)
│   ├── card.tsx                      Card, CardHeader, CardContent, CardFooter
│   ├── badge.tsx                     LevelBadge, ItemBadge, Badge
│   ├── input.tsx                     Input, Textarea, Select (con label)
│   ├── dialog.tsx                    Dialog modal (Escape para cerrar)
│   └── accordion.tsx                 AccordionItem, Spinner, EmptyState
└── analysis/
    ├── LevelWrapper.tsx              Barra de estado + botones Process/Approve por nivel
    ├── Level1.tsx                    Metáforas primarias (expandibles, approve/reject)
    ├── Level2.tsx                    Metáforas convencionales (frecuencia, robustez)
    ├── Level3.tsx                    Escenarios (grupos sociales, narrativa, afectos)
    ├── Level4.tsx                    Regímenes (metáforas derivadas, ejes de valor)
    └── Level5.tsx                    Narrativa cultural

lib/
├── api.ts         Cliente fetch (authApi, corpusApi, documentApi, analysisApi)
├── auth.ts        getToken/setToken/clearToken/getUser/isLoggedIn (localStorage)
└── utils.ts       cn(), levelStatusLabel(), docTypeLabel()

types/index.ts     Todos los tipos TypeScript (LevelStatus, ItemStatus, Corpus, Document, Analysis, etc.)
```

---

## Endpoints del API

### Auth
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/auth/google` | Inicia flujo OAuth con Google |
| GET | `/auth/google/callback` | Callback de Google, genera JWT y redirige al frontend |
| POST | `/auth/guest` | Crea usuario invitado, devuelve `{ token }` |
| POST | `/auth/guest/logout` | Elimina usuario invitado de la DB |
| GET | `/auth/me` | Devuelve el payload del JWT actual |

### Corpus
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/corpus` | Lista corpus del usuario autenticado |
| GET | `/corpus/:id` | Detalle de un corpus con documentos |
| POST | `/corpus` | Crear corpus |
| PUT | `/corpus/:id` | Actualizar corpus |
| DELETE | `/corpus/:id` | Eliminar corpus y todo su contenido |

### Documentos
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/documentos?corpusId=` | Lista documentos de un corpus |
| GET | `/documentos/:id` | Detalle del documento (incluye `analysis`) |
| POST | `/documentos` | Crear documento |
| DELETE | `/documentos/:id` | Eliminar documento |
| POST | `/documentos/:id/analisis` | Inicializar análisis (`{ aiProvider }`) |

### Análisis
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/analisis/:id` | Estado general del análisis (todos los LevelStatus) |
| POST | `/analisis/:id/nivel/:n/process` | Lanza IA para el nivel n (1–5) |
| GET | `/analisis/:id/nivel/:n` | Obtiene datos del nivel n |
| POST | `/analisis/:id/nivel/:n/approve-all` | Aprueba todos los ítems del nivel n |
| POST | `/analisis/:id/nivel/:n/approve` | Aprueba el nivel n completo |
| PATCH | `/analisis/items/:model/:itemId/status` | Cambia estado de un ítem individual |

**Modelos válidos para `PATCH items`:** `primaryMetaphor`, `ontologicalMapping`, `epistemicMapping`, `conventionalMetaphor`, `metaphoricalScenario`, `metaphorRegime`, `culturalNarrative`

---

## Consideraciones técnicas para el desarrollador

### Tailwind v4
La configuración **no usa `tailwind.config.ts`**. Se configura directamente en `globals.css`:
```css
@import "tailwindcss";
@theme inline {
  --color-background: var(--background);
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### Google Fonts bloqueado en el entorno de desarrollo
El entorno donde se construyó el frontend no tenía acceso a `fonts.googleapis.com`. Por eso se usa una pila de fuentes del sistema (`-apple-system, BlinkMacSystemFont, 'Segoe UI'`) en lugar de Geist. Si se desea usar Geist u otra fuente de Google, se puede volver a agregar `next/font/google` en `layout.tsx`, o usar fuentes locales con `next/font/local`.

### shadcn/ui escrito a mano
El CLI de shadcn requiere acceso a `ui.shadcn.com` en tiempo de instalación. Como no estaba disponible, todos los componentes UI se escribieron manualmente siguiendo la misma API. Si en el futuro se quiere migrar al CLI de shadcn, los componentes en `src/components/ui/` pueden reemplazarse uno a uno sin impacto en el resto del código.

### Autenticación en App Router
Como el token JWT está en `localStorage` (no en cookies), el middleware de Next.js (`src/middleware.ts`) no puede verificar autenticación en el servidor. La protección de rutas se hace en el cliente: el layout `(app)/layout.tsx` redirige a `/` si no hay token válido. Si en el futuro se necesita protección server-side, habría que migrar el token a una cookie `HttpOnly`.

### Polling de estados PROCESSING
Cuando un nivel está en `PROCESSING`, la página del documento hace polling cada 4 segundos al endpoint `GET /analisis/:id`. Cuando el estado cambia, se detiene el polling y se recargan los datos del nivel. Esto es funcional pero básico: para producción se podría reemplazar con WebSockets o Server-Sent Events.

### `ConsolidatedAnalysis` (schema)
El schema de Prisma incluye modelos para análisis consolidado a nivel de corpus (`ConsolidatedAnalysis`, `ConsolidatedConventionalMetaphor`, etc.). Estos modelos están definidos en la DB pero **no tienen endpoints ni UI implementados todavía**. Es la siguiente fase del proyecto.

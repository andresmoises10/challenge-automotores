# CLAUDE.md - Stack & Arquitectura

## Stack

- **Frontend:** Angular 20 LTS + PrimeNG 20 + Tailwind 3.x
- **Backend:** NestJS 10 LTS + TypeORM + PostgreSQL 16
- **Testing:** Jasmine/Karma (FE) + Jest (BE)
- **Containerization:** Docker + Docker Compose

---

## Arquitectura Frontend (Angular 20)

### Estructura
```
apps/frontend/src/app/
├── core/
│   ├── interceptors/     # error.interceptor, error.mapper
│   ├── guards/           # unsaved-changes.guard
│   └── models/           # DTOs: Automotor, Sujeto, AppError
├── shared/
│   ├── components/       # Reutilizables
│   ├── validators/       # Funciones puras: CUIT, Dominio, Fecha
│   └── pipes/
├── features/
│   ├── automotores/
│   │   ├── pages/        # Listado, Form
│   │   └── services/     # API, State, Facade
│   └── sujetos/
│       └── services/     # Stubs
├── app.routes.ts         # Lazy loading
├── app.config.ts         # Providers globales
└── app.component.ts      # Root
```

### Decisiones Clave
- **Standalone components** (sin NgModules)
- **OnPush change detection** global
- **Signals + RxJS** coexistencia (no reemplazo)
- **Tres capas:** ApiService → StateService → FacadeService → Components
- **Error mapping centralizado:** Interceptor mapea 422 → fieldErrors

---

## Arquitectura Backend (NestJS 10)

### Estructura
```
apps/backend/src/
├── config/
│   ├── database.config.ts
│   ├── constants.ts
│   └── index.ts
├── sujetos/
│   ├── entities/         # SujetoEntity
│   ├── dtos/             # CreateSujetoDto
│   ├── sujetos.service.ts
│   ├── sujetos.controller.ts
│   └── sujetos.module.ts
├── automotores/
│   ├── entities/         # AutomotorEntity
│   ├── dtos/             # CreateAutomotorDto, UpdateAutomotorDto
│   ├── validators/       # CUIT, Dominio, Fecha
│   ├── automotores.service.ts
│   ├── automotores.controller.ts
│   └── automotores.module.ts
├── app.module.ts
└── main.ts
```

### Decisiones Clave
- **TypeORM + PostgreSQL** (entities, migrations, type-safe queries)
- **Validadores custom** en DTOs (class-validator)
- **BadRequestException → 422** con fieldErrors
- **Lazy loading relaciones** (eager: true donde aplique)

---

## API Contracts

### GET /api/automotores?page=1&limit=10
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

### POST /api/automotores (201)
**Request:**
```json
{
  "dominio": "AAA999",
  "chasis": "ABC123",
  "motor": "DEF456",
  "color": "Blanco",
  "fechaFabricacion": "202401",
  "cuit": "20123456789"
}
```

### POST /api/automotores (422 - Error)
```json
{
  "statusCode": 422,
  "code": "VALIDATION_ERROR",
  "message": "Validación fallida",
  "fieldErrors": {
    "dominio": "Dominio duplicado",
    "cuit": "CUIT inválido"
  }
}
```

### GET /api/sujetos/by-cuit?cuit=20123456789
```json
{
  "id": 1,
  "cuit": "20123456789",
  "nombre": "Juan Pérez",
  "tipo": "PERSONA_FISICA"
}
```

### POST /api/sujetos (201)
```json
{
  "id": 1,
  "cuit": "20123456789",
  "nombre": "Juan Pérez",
  "tipo": "PERSONA_FISICA"
}
```

---

## Flujos Críticos

### 1. Crear Automotor (Happy Path)
1. POST /api/automotores { dominio, chasis, ..., cuit }
2. Backend valida DTO + lógica de negocio
3. Verifica CUIT existe en sujetos
4. Verifica dominio no duplicado
5. Guarda en DB
6. Frontend recibe 201 + automotor
7. Agrega a signal state
8. Toast success + navigate

### 2. Error 422 (Dominio Duplicado)
1. POST /api/automotores { dominio: "AAA999", ... }
2. Backend detecta duplicado → BadRequestException
3. ExceptionFilter mapea a 422 + fieldErrors
4. Frontend Interceptor mapea a AppError
5. Component itera fieldErrors → setErrors() en controls
6. Template muestra mensajes en campos específicos

### 3. CUIT No Existe → Crear Sujeto
1. User intenta crear automotor con CUIT nuevo
2. Backend devuelve 400 { code: "SUJETO_NOT_FOUND" }
3. Frontend detecta código → abre modal "Crear Sujeto"
4. POST /api/sujetos { nombre, tipo, cuit }
5. Sujeto creado
6. Frontend reintenta crear automotor (CUIT ahora existe)
7. Success

---

## Docker Compose

```bash
docker-compose up
```

Levanta:
- **PostgreSQL 16** → localhost:5432
- **Backend NestJS** → http://localhost:3000
- **Frontend Angular** → http://localhost:4200

---

## Decisiones Documentadas

| # | Decisión | Justificación |
|----|----------|---------------|
| 1 | Angular 20 + PrimeNG 20 | Versiones sincronizadas, LTS, control flow nativo |
| 2 | Standalone components | Mejor tree-shaking, explicit dependencies |
| 3 | OnPush global | Performance + fuerza buenas prácticas |
| 4 | Signals + RxJS | Coexistencia inteligente, no reemplazo |
| 5 | Tres capas servicios | Separación clara, testeable, escalable |
| 6 | Error handling centralizado | Interceptor + 422 mapping + fieldErrors |
| 7 | Monorepo (apps/frontend + apps/backend) | One-liner deployment, evaluación clara |
| 8 | NestJS 10 + TypeORM + PostgreSQL | Maduro, type-safe, relacional |
| 9 | Custom validators DTOs | Automático, reutilizable, testeable |
| 10 | Validadores como funciones puras | Frontend + Backend reutilizan lógica |

---

## Validaciones (Frontend + Backend)

- **CUIT:** 11 dígitos + módulo 11
- **Dominio:** AAA999 o AA999AA
- **Fecha Fabricación:** YYYYMM (mes 01-12, no futuro)

Implementadas como:
- **Frontend:** Funciones puras (`cuit.validator.ts`, etc) + Angular validators
- **Backend:** Class-validator decoradores + custom validators

---

## Performance & Optimizaciones

- OnPush change detection global
- trackBy en listas
- Lazy loading por feature
- No suscripciones colgadas (takeUntilDestroyed)
- Signals para estado local derivado
- Bundle < 250KB (main chunk, gzip)

---

## Testing

- **Unit:** Validadores + servicios
- **Component:** Listado (render, search, pagination) + Form (validación, 422)

---

## Arranque Rápido

### Development
```bash
docker-compose up
```

### Frontend Solo
```bash
cd apps/frontend
npm start
```

### Backend Solo
```bash
cd apps/backend
npm run start:dev
```

### Tests
```bash
npm run test:fe      # Frontend
npm run test:be      # Backend
```

---

## Supuestos

- Node 20+, npm 10+, Docker Desktop
- PostgreSQL 16 (en docker, no requiere instalación local)
- Desarrollo en Windows/Mac/Linux

---

## Referencias

- **DECISION_LOG.md** → Decisiones arquitectónicas detalladas
- **docs/ESCALABILIDAD_FRONT.md** → Plan de escalabilidad
- **docs/IA_ACELERADORES.md** → Uso de IA en desarrollos
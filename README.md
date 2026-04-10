# Challenge Automotores

CRUD de automotores con asignación de propietario por CUIT. Stack: Angular 20 + NestJS 11 + PostgreSQL 16.

---

## Arranque rápido (Docker)

```bash
cp .env.example .env
docker-compose up --build
```

| Servicio   | URL                              |
|------------|----------------------------------|
| Frontend   | http://localhost:4200            |
| Backend    | http://localhost:3030            |
| Swagger    | http://localhost:3030/api/docs   |
| PostgreSQL | localhost:5432                   |

> La base de datos se inicializa automáticamente al levantar. No requiere migraciones manuales (`synchronize: true` en desarrollo).

---

## Arranque local (sin Docker)

### Requisitos

- Node.js 20+
- PostgreSQL 16 corriendo en `localhost:5432`

### Backend

```bash
cd apps/backend
npm install
# Crear un .env con las variables de DATABASE (ver .env.example)
npm run start:dev
```

El servidor queda en `http://localhost:3030`.

### Frontend

```bash
cd apps/frontend
npm install
npm start
```

La app queda en `http://localhost:4200`. El proxy redirige `/api/*` → `http://localhost:3030`.

---

## Tests

### Frontend

```bash
cd apps/frontend

# Unit tests (validadores + componentes + servicios)
npm test

# Watch mode
npm run test -- --watch
```

### Backend

```bash
cd apps/backend

# Unit + integration tests
npm test

# Coverage
npm run test:cov
```

---

## Estructura del proyecto

```
challenge-automotores/
├── apps/
│   ├── backend/                  # NestJS 11
│   │   └── src/
│   │       ├── automotores/      # Módulo CRUD automotores
│   │       ├── sujetos/          # Módulo propietarios por CUIT
│   │       ├── common/           # Filtros, excepciones globales
│   │       └── config/           # Configuración TypeORM
│   └── frontend/                 # Angular 20
│       └── src/app/
│           ├── core/             # Interceptores, modelos, guards
│           ├── features/
│           │   ├── automotores/  # Listado + formulario CRUD
│           │   └── sujetos/      # Servicio de consulta/alta de sujetos
│           └── shared/           # Validators reutilizables
├── docs/                         # Decisiones técnicas y escalabilidad
├── docker-compose.yml
└── .env.example
```

---

## API REST

| Método | Endpoint                          | Descripción                  |
|--------|-----------------------------------|------------------------------|
| GET    | `/api/automotores`                | Listar todos los automotores |
| GET    | `/api/automotores/:dominio`       | Obtener por dominio          |
| POST   | `/api/automotores`                | Crear automotor              |
| PUT    | `/api/automotores/:dominio`       | Editar automotor             |
| DELETE | `/api/automotores/:dominio`       | Eliminar automotor           |
| GET    | `/api/sujetos/by-cuit?cuit=`      | Buscar propietario por CUIT  |
| POST   | `/api/sujetos`                    | Crear propietario            |

Documentación interactiva disponible en Swagger: `http://localhost:3030/api/docs`

---

## Reglas de negocio

| Campo             | Regla                                                                 |
|-------------------|-----------------------------------------------------------------------|
| Dominio           | Formato `AAA999` (viejo) o `AA999AA` (Mercosur)                       |
| CUIT              | 11 dígitos, válido por módulo 11                                      |
| Fecha fabricación | Formato `YYYYMM`, mes entre 01–12, no puede ser fecha futura          |
| Chasis / Motor    | Alfanumérico, entre 6 y 20 caracteres                                 |
| Color             | Texto libre, máximo 50 caracteres                                     |

### Flujo de propietario no encontrado

Si al crear un automotor el CUIT no existe en el sistema, el frontend muestra un modal para dar de alta el propietario sin salir del formulario. Una vez creado, reintenta automáticamente el registro del automotor.

---

## Decisiones técnicas relevantes

Ver [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md) para el detalle completo. Puntos clave:

- **OnPush + Signals** en todos los componentes para minimizar ciclos de detección de cambios.
- **Lazy loading** por feature (`automotores`, `sujetos`) para reducir el bundle inicial.
- **Facade pattern** en `AutomotoresFacadeService` para separar orquestación de estado de los componentes de presentación.
- **Interceptor centralizado** para mapear errores HTTP a un contrato uniforme (`ApiErrorInterface`), incluyendo manejo diferenciado de 422 (validación) y 400 (errores de negocio como `SUJETO_NOT_FOUND`).

---

## Variables de entorno

Ver `.env.example` para la lista completa. Variables mínimas necesarias:

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=automotores_db
```

---

## Supuestos técnicos

- `synchronize: true` en TypeORM solo para desarrollo. En producción se usarían migraciones.
- La paginación es client-side dado el volumen de datos esperado (< 10.000 registros).
- El tipo de sujeto al crearse desde el modal se asigna como `PERSONA_FISICA` por defecto; puede extenderse con un selector en el modal.
- No se implementó autenticación/autorización ya que no forma parte del scope del challenge.
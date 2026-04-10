# DECISION LOG — Decisiones Arquitectónicas

Sistema de Gestión de Automotores — Challenge Técnico

---

## DECISIÓN 1: Framework Frontend — Angular 20 LTS

### Decisión
Usar Angular 20 SPA LTS como framework principal del frontend.

### Justificación
- LTS estable con soporte extendido garantizado.
- Control flow nativo (`@if`, `@for`) mejora la legibilidad de templates respecto a v18.
- Signals: especialmente para implementación de un manejo de estado sencillo mediante un servicio sin sobre-ingeniería en ngrx.
- Versiones sincronizadas con PrimeNG 20, eliminando conflictos de peer dependencies.
- Consideré que no era necesario un ssr para el scope. Ya que todo funciona desde el lado del cliente.

---

## DECISIÓN 2: UI Components — PrimeNG 20

**Estado:** ✅ Aceptada  
**Alternativas evaluadas:** Angular Material, componentes custom

### Decisión
Usar PrimeNG 20 como librería de componentes UI.

### Justificación
- Componentes production-ready para el scope: `p-table`, `p-dialog`, `p-skeleton`, `p-inputtext`, `p-button`.
- A11y integrada (WCAG 2.1 AA) sin configuración adicional.
- API de theming compatible con Tailwind sin conflictos CSS mayores.
- Mejor ROI en 48h vs construir componentes custom o configurar Material.

### Trade-offs
- Bundle size: +180KB. Mitigado con lazy loading y tree-shaking de Angular 20.
- API grande: se acota el uso a 5 componentes clave para reducir curva de aprendizaje.

---

## DECISIÓN 3: CSS — Tailwind CSS 3.x

**Estado:** ✅ Aceptada  
**Alternativas evaluadas:** SCSS custom, CSS-in-JS

### Decisión
Usar Tailwind CSS 3.x para layout y utilities.

### Justificación
- Velocidad de desarrollo: spacing, responsive y utilities sin escribir CSS propio.
- Bundle final pequeño (~15KB gzip) gracias al purgeCSS integrado con el build de Angular.
- Composición limpia: PrimeNG gestiona los componentes, Tailwind gestiona el layout.

### Trade-offs
- Posibles conflictos CSS con PrimeNG. Resolución: `important: true` en `tailwind.config.js` y `ViewEncapsulation.ShadowDom` donde aplique.

---

## DECISIÓN 4: State Management — Signals + Servicios (sin NgRx)

**Estado:** ✅ Aceptada  
**Alternativas evaluadas:** NgRx, SignalStore

### Decisión
Gestión de estado con Signals de Angular + patrón de tres servicios por feature. NgRx y SignalStore descartados explícitamente.

### Patrón de servicios aplicado
Cada feature implementa tres servicios con responsabilidades separadas:

| Servicio | Responsabilidad |
|---|---|
| `*-api.service.ts` | Solo HTTP. Sin lógica de negocio. |
| `*-state.service.ts` | Estado reactivo con Signals. Sin HTTP. |
| `*-facade.service.ts` | Orquestación: coordina API + State. |

### Justificación
- El scope del challenge (2 entidades) no justifica el boilerplate de NgRx: actions, reducers, effects y selectors para tan poco.
- Signals de Angular 20 cumplen el mismo rol de reactividad granular con cero dependencias externas.
- SignalStore fue considerado en el planteo inicial pero descartado: agrega una capa de abstracción innecesaria para este scope. Signals puros + servicios alcanzan.

### Trade-offs
- Sin devtools de NgRx para debugging de estado. Aceptable para el scope.

---

## DECISIÓN 5: Formularios — Reactive Forms

**Estado:** ✅ Aceptada

### Decisión
Usar Reactive Forms en todos los formularios del proyecto.

### Justificación
- Tipado fuerte con TypeScript (typed forms desde Angular 14+).
- Validadores custom como funciones puras, testables sin necesidad de DOM ni Angular TestBed.
- Performance granular al combinarse con Signals.

### Trade-offs
- Más verbosidad inicial en la definición del form. Considerado aceptable y deseable para legibilidad.

---

## DECISIÓN 6: Backend — NestJS 11 LTS

**Estado:** ✅ Aceptada

### Decisión
Usar NestJS 11 LTS como framework backend.

### Justificación
- Estructura opinionada (módulos, controllers, services) que acelera el desarrollo sin decisiones de arquitectura adicionales. Se optó por un flujo de trabajo orientado al frontend sin descuidar las características de construcción de API.
- TypeScript first-class: decoradores, tipado fuerte desde la base.
- `class-validator` y `class-transformer` integrados para validación de DTOs.
- DI container nativo: facilita el testing con mocks.
- `ValidationPipe` global: valida y transforma todos los DTOs automáticamente.

### Trade-offs
- Más setup inicial que Express puro. Justificado por la velocidad que da en el desarrollo posterior.

---

## DECISIÓN 7: Base de Datos — PostgreSQL 16 + TypeORM

### Decisión
Usar PostgreSQL 16 como base de datos y TypeORM como ORM.

### Justificación
- El modelo de datos es relacional: un automotor tiene un propietario (sujeto), con integridad referencial.
- TypeORM: madurez en ecosistema NestJS, decoradores para entities, migraciones automáticas.
- SQLite descartado: no adecuado para entorno Docker multi-container.
- MongoDB descartado: el modelo relacional no justifica NoSQL.

### Trade-offs
- Más setup que SQLite. Resuelto con Docker Compose que levanta Postgres automáticamente.

---

## DECISIÓN 8: Infraestructura — Docker + Docker Compose

### Decisión
Levantar el sistema con Docker Compose con tres servicios: `frontend`, `backend`, `db`.

| Servicio | Imagen | Puerto |
|---|---|---|
| `frontend` | `nginx:alpine` | 4200 |
| `backend` | `node:20-alpine` | 3030 |
| `db` | `postgres:16-alpine` | 5432 |

### Justificación
- El evaluador puede correr el proyecto completo con un solo `docker compose up`.
- Multi-stage build en el Dockerfile del frontend: stage 1 (node) compila Angular, stage 2 (nginx) sirve el `dist/`. Imagen final < 30MB.
- Secrets: sin hardcodeo. `.env.example` versionado, `.env` en `.gitignore`.
- Health checks: el backend espera que Postgres esté listo antes de iniciar (`depends_on` + `condition: service_healthy`).
- Volumes nombrados para Postgres: los datos persisten entre `down`/`up`.

---

## DECISIÓN 9: Arquitectura de Carpetas — Feature-based (Core / Shared / Features)

### Decisión
Separar el frontend en tres capas con responsabilidades claras.

```
src/app/
├── core/        # Singletons globales: interceptores, guards, modelos, error handler
├── shared/      # Reutilizable: componentes, validators puros, pipes
└── features/
    ├── automotores/   # pages/ + services/ (API, State, Facade) + routing lazy
    └── sujetos/       # pages/ + services/ + routing lazy
```

### Regla de dependencias
- `features/` puede importar de `core/` y `shared/`.
- `shared/` y `core/` **nunca** importan de `features/`.
- Módulos de NestJS son autocontenidos. Cross-module solo vía `exports` explícitos.
- DTOs con propósito único: `create-dto` ≠ `update-dto` ≠ `response-dto`.

---

## DECISIÓN 10: Testing — Unit + Integration

**Estado:** ✅ Aceptada
**Alternativas evaluadas:** Cobertura E2E con Cypress o Playwright

### Decisión
Jest para unit/integration en backend. Jasmine/Karma para unit en frontend. E2E descartado por tiempo.

| Nivel | Herramienta | Qué se testea |
|---|---|---|
| Unit | Jest / Jasmine | Validators, services, mappers — lógica pura |
| Integration | Jest + Supertest | API endpoints críticos contra DB de test |

### Justificación
- Validators como funciones puras: testables sin Angular TestBed ni DOM.
- Repository mockeado en service tests: lógica de negocio sin DB real.
- E2E descartado: el flujo crítico (alta de automotor) quedó fuera del scope por tiempo. En un proyecto real sería el primer test a agregar — el flujo de alta con reasignación de CUIT es exactamente el tipo de caso que un E2E cubre mejor que cualquier unit test.

---

## DECISIÓN 11: Estructura de repositorio — Monorepo sin Nx

**Estado:** ✅ Aceptada  
**Alternativas evaluadas:** Nx, Turborepo, repositorios separados (frontend / backend)

### Decisión
Organizar frontend y backend en un único repositorio sin herramienta de gestión de monorepo.

```
/
├── frontend/    # Angular 20
├── backend/     # NestJS 11
├── docker-compose.yml
└── .env.example
```

### Justificación

**Ventajas del monorepo simple para este scope:**
- **Control unificado del ciclo de vida:** un solo `git clone`, un solo `docker compose up`. El evaluador tiene el sistema completo sin coordinar múltiples repos ni sincronizar versiones.
- **Cambios atómicos:** una modificación que impacta frontend y backend queda en un único commit. No hay riesgo de desincronización entre repos.
- **Configuración centralizada:** `docker-compose.yml`, `.env.example` y scripts de setup viven en la raíz y aplican a todo el sistema desde un único lugar.
- **Visibilidad de la arquitectura completa:** quien revisa el código ve de un vistazo la separación de responsabilidades, las capas y la relación entre ambas aplicaciones.
- **Sin overhead de herramientas:** Nx agrega valor real en monorepos con 5+ proyectos, pipelines de CI complejos y equipos grandes. Para 2 proyectos en 48h es puro setup sin retorno.

**Por qué se descartó Nx:**
- El tiempo de configuración de Nx (executors, project graph, cache distribuida) no se recupera en el scope del challenge.
- Las ventajas más potentes de Nx — build cache, `affected` commands, code generation — son irrelevantes cuando el proyecto se desarrolla y evalúa una sola vez.

### Lo que se hubiera hecho con más tiempo

Con más tiempo, la estructura del monorepo hubiera evolucionado hacia una **carpeta `shared/` en la raíz** para alojar DTOs compartidos entre frontend y backend:

```
/
├── frontend/
├── backend/
├── shared/
│   └── dtos/
│       ├── automotor.dto.ts    # Un solo lugar de verdad
│       └── sujeto.dto.ts
├── docker-compose.yml
└── package.json                # Workspace root (npm workspaces o pnpm)
```

**Por qué esto importa:**

Hoy el frontend tiene sus propios modelos (`core/models/automotor.ts`) y el backend tiene sus propios DTOs (`automotores/dtos/`). Si cambia un campo en la entidad hay que actualizar en dos lugares, y si uno de los dos se olvida el error es silencioso: TypeScript no puede cruzar el límite de proceso para avisarte.

Con DTOs compartidos vía workspace:
- El tipo `CreateAutomotorDto` es **exactamente el mismo objeto** que el backend valida y el frontend construye en el formulario. No hay dos versiones que puedan divergir.
- Un cambio en el contrato de la API es un cambio en un único archivo. TypeScript propaga el error a todos los consumidores — frontend y backend — automáticamente en tiempo de compilación.
- Se elimina la posibilidad de desincronización silenciosa entre lo que el frontend envía y lo que el backend espera, que es uno de los bugs más difíciles de rastrear en sistemas fullstack.

Esta es la ventaja real de un monorepo con workspace: no solo tener el código junto, sino **compartir tipos entre procesos**. En el contexto del challenge se priorizó la velocidad de entrega sobre esta optimización, que hubiera requerido configurar npm/pnpm workspaces y ajustar los `paths` de TypeScript en ambos proyectos.

---

## DECISIÓN 12: API Documentation — Swagger / OpenAPI

**Estado:** ✅ Aceptada
**Alternativas evaluadas:** Postman collection, sin documentación

### Decisión
Integrar Swagger (OpenAPI 3.0) via `@nestjs/swagger` en el backend, accesible en `/api/docs`.

### Justificación
- El contrato de API es visible e interactuable desde el browser sin herramientas externas. Cualquier persona que revise el proyecto puede probar los endpoints sin instalar Postman ni conocer la estructura de requests de antemano.
- Los decoradores de Swagger (`@ApiProperty`, `@ApiResponse`) son colocados sobre los DTOs que ya existen — no hay costo de mantenimiento adicional porque la documentación vive junto al código que describe.
- En un sistema con validaciones custom (CUIT, dominio, fecha), documentar los formatos esperados directamente en el schema evita fricción en la integración.

### Trade-offs
- Agrega `@nestjs/swagger` como dependencia de producción. Mitigado: el bundle del backend no es un constraint relevante en este contexto.

---

## DECISIÓN 13: Validadores en dos capas — Funciones puras + Reactive Validators

**Estado:** ✅ Aceptada

### Decisión
Implementar cada validador en dos artefactos independientes: una función pura (`isCuitValid(cuit: string): boolean`) y un Angular `ValidatorFn` que la consume (`cuitValidator(): ValidatorFn`).

### Justificación
La separación no es burocrática — resuelve un problema concreto de testabilidad. Una función pura se testea con una línea:

```typescript
expect(isCuitValid('20123456789')).toBe(true);
```

Un `ValidatorFn` requiere construir un `AbstractControl`, lo que arrastra Angular TestBed al test. Al aislar la lógica de validación del contrato de Angular, los tests de validadores son unitarios en el sentido estricto: sin framework, sin DOM, sin setup.

El `ValidatorFn` es solo un adapter: toma el valor del control y delega a la función pura. Si la lógica cambia, cambia en un solo lugar y ambas capas lo reflejan.

### Trade-offs
- Dos archivos por validador en lugar de uno. Considerado aceptable dado el beneficio en testabilidad y la claridad de la separación.

---

## DECISIÓN 14: Seed de datos inicial

**Estado:** ✅ Aceptada
**Alternativas evaluadas:** Migraciones con datos, carga manual, sin seed

### Decisión
Implementar un `SeederService` que popula la base de datos con sujetos y automotores de ejemplo al levantar el sistema en modo desarrollo.

### Justificación
El seed no es comodidad, es una decisión de producto: el sistema debe ser evaluable desde el primer `docker compose up`. Sin datos iniciales, quien revisa el proyecto enfrenta una tabla vacía y tiene que construir el contexto antes de poder evaluar el comportamiento real de la app — paginación, búsqueda, edición, eliminación.

El seed garantiza que el flujo crítico de la aplicación es observable sin fricción de setup. Es la diferencia entre un demo que funciona y uno que requiere instrucciones adicionales.

### Trade-offs
- El seed corre condicionado a `NODE_ENV !== 'production'` para evitar colisiones en entornos reales.

---

## DECISIÓN 15: Gestión de suscripciones — `DestroyRef` + `takeUntilDestroyed`

**Estado:** ✅ Aceptada
**Alternativas evaluadas:** `Subject` + `takeUntil`, `async` pipe, `ngOnDestroy` manual

### Decisión
Gestionar el ciclo de vida de las suscripciones RxJS con `DestroyRef` inyectado en el constructor y `takeUntilDestroyed(this.destroyRef)` en cada pipe.

### Justificación
El patrón clásico con `Subject` requiere declarar el subject, completarlo en `ngOnDestroy` e implementar la interfaz — tres puntos de código para resolver un único problema. Con `DestroyRef`, la intención queda en una línea donde ocurre la suscripción, no separada en un lifecycle hook distinto.

Más importante: `takeUntilDestroyed` funciona en cualquier contexto de inyección — componentes, servicios, directivas — sin depender de `ngOnDestroy`. En un `FacadeService` que vive fuera del árbol de componentes, el patrón clásico requiere workarounds. Con `DestroyRef` es transparente.

### Trade-offs
- Requiere Angular 16+. En este proyecto con Angular 20, no hay restricción.

---

## DECISIÓN 16: Contrato de errores HTTP — 422 vs 400

**Estado:** ✅ Aceptada

### Decisión
Diferenciar semánticamente dos categorías de error en la API:

| Código | Categoría | Ejemplo |
|---|---|---|
| **422** Unprocessable Entity | Errores de validación de campos | CUIT inválido, dominio duplicado |
| **400** Bad Request | Errores de lógica de negocio | `SUJETO_NOT_FOUND` |

### Justificación
HTTP 400 ("la request está mal formada") y HTTP 422 ("la request está bien formada pero no se puede procesar") no son sinónimos. Colapsarlos en un solo código obliga al cliente a parsear el body para entender qué clase de error recibió — lo que convierte el status code en decoración.

Con la distinción implementada, el frontend puede ramificar en el interceptor sin inspeccionar el body: un 422 siempre tiene `fieldErrors` para mapear a controles del formulario; un 400 con `code: SUJETO_NOT_FOUND` dispara el modal de creación de sujeto. La lógica de UI queda determinada por el protocolo, no por strings arbitrarios del backend.

### Trade-offs
- Requiere disciplina en el backend para no mezclar códigos. Resuelto con el `ValidationExceptionFilter` que centraliza el mapeo en un único lugar.

---

## DECISIÓN 17: TypeORM `synchronize` — diferenciado por entorno

**Estado:** ✅ Aceptada
**Alternativas evaluadas:** `synchronize: true` siempre, migraciones desde el inicio

### Decisión
Configurar `synchronize: !isProduction` en TypeORM: creación automática de schema en desarrollo, schema inmutable en producción.

### Justificación
`synchronize: true` en producción es un riesgo operacional: un cambio en una entity puede traducirse en una ALTER TABLE o DROP COLUMN automático sobre datos reales. No es una posibilidad remota — es el comportamiento documentado.

En desarrollo, la fricción de correr migraciones en cada iteración no aporta valor y ralentiza el ciclo. El tradeoff es asimétrico: el costo de `synchronize: true` en dev es cero, el costo en prod puede ser pérdida de datos.

La configuración diferenciada por `NODE_ENV` resuelve ambos lados: velocidad en desarrollo, seguridad en producción. Cuando el proyecto escale a un entorno de staging o producción real, las migraciones de TypeORM (`typeorm migration:generate`) reemplazarían el synchronize sin cambios en el resto de la configuración.

### Trade-offs
- El schema de dev puede divergir del de producción si no se generan migraciones. Aceptable en el contexto del challenge donde no existe un entorno de producción real.

---

## Resumen de decisiones

| # | Área | Decisión | Descartado |
|---|---|---|---|
| 1 | Framework | Angular 20 LTS | Angular 18/19 |
| 2 | UI Components | PrimeNG 20 | Angular Material |
| 3 | CSS | Tailwind CSS 3.x | SCSS custom |
| 4 | State | Signals + Servicios | NgRx, SignalStore |
| 5 | Forms | Reactive Forms | Template-driven |
| 6 | Backend | NestJS 11 LTS | Express |
| 7 | ORM / DB | TypeORM + PostgreSQL 16 | SQLite, MongoDB |
| 8 | Infra | Docker Compose | Kubernetes |
| 9 | Estructura | Feature-based (Core/Shared/Features) | — |
| 10 | Testing | Jest + Jasmine/Karma (unit + integration) | Cypress, Playwright, cobertura E2E |
| 11 | Repositorio | Monorepo sin Nx | Nx, repos separados |
| 12 | API Docs | Swagger / OpenAPI | Postman collection |
| 13 | Validadores | Funciones puras + Reactive adapters | ValidatorFn directo |
| 14 | Seed | SeederService en dev | Carga manual |
| 15 | Suscripciones | DestroyRef + takeUntilDestroyed | Subject + takeUntil |
| 16 | Errores HTTP | 422 (campos) vs 400 (negocio) | 400 para todo |
| 17 | TypeORM sync | synchronize por entorno | synchronize: true fijo |

---

## Reflexión

Este es el alcance final de mis decisiones técnicas para el desarrollo. Quiero destacar que desde el principio se utilizó Claude Code y Claude para el planteo inicial de arquitectura y refinamiento de código. Los tests están planteados con IA porque entiendo que contempla mayor cantidad de escenarios de los que puedo cubrir yo en 48hs.

Este challenge me llevó a ocupar un rol no solo de desarrollador sino de analista del proyecto, que creo que es el nuevo rol que ocupamos los devs ante el avance de estas tecnologías. Pensé primero en reglas de negocio funcionales a un usuario final, priorizando prácticas de experiencia de usuario más que interfaces con valor o impacto estético. Me puse en rol de arquitecto: yo planteé la arquitectura y el funcionamiento para mejorar la eficiencia del desarrollo.

Opté por una arquitectura monorepo para trabajar de manera más controlada, descarté Nx por el alcance y el tiempo. Decidí no ir más allá de Signals para manejo de estado, aunque por un momento en el planteo inicial consideré SignalStore. Express fue una solución pensada para el backend, pero gané mucho en velocidad gracias a la elección de NestJS. Ademas decidi implementar un seed para que el usuario pueda realizar acciones desde el principio 
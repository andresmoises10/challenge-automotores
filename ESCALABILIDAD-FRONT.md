# SCALABILITY — Estrategia de Escalabilidad y Evolución

Sistema de Gestión de Automotores — Challenge Técnico

---

## 1. Estrategia para escalar a 20 formularios similares

El problema con 20 formularios no es escribirlos, es que sin una estrategia terminás con 20 implementaciones ligeramente distintas del mismo patrón. La solución es invertir en una **base de formulario abstracta** desde el principio.

### BaseFormComponent

Un componente abstracto que todos los formularios extienden:

```typescript
abstract class BaseFormComponent<T> {
  abstract form: FormGroup;
  abstract toModel(): T;

  isFieldInvalid(field: string): boolean { ... }
  getFieldError(field: string): string { ... }
  handleSubmit(): void { ... }
}
```

Cada formulario nuevo hereda el comportamiento de validación, submit y manejo de errores. Solo define su propio `FormGroup` y su mapeo a modelo. Agregar el formulario 20 cuesta lo mismo que agregar el 3.

### FormFactory service

Un servicio que construye `FormGroup` a partir de una configuración declarativa:

```typescript
const config: FieldConfig[] = [
  { name: 'cuit', type: 'text', validators: [cuitValidator] },
  { name: 'dominio', type: 'text', validators: [dominioValidator] },
];
```

Esto no significa dynamic forms generados por JSON desde el backend — eso es overengineering. Significa tener una convención clara y tipada para declarar campos, que se traduce siempre al mismo patrón de `FormGroup`.

---

## 2. Diseño de componentes reutilizables y librería interna UI

La librería interna no es un paquete npm separado desde el día uno. Empieza como la carpeta `shared/` bien disciplinada y evoluciona cuando el dolor aparece.

### Nivel 1 — shared/ (ahora)

Componentes atómicos que ya existen o deberían existir: `<app-field-error>`, `<app-confirmation-dialog>`, `<app-skeleton-loader>`, `<app-empty-state>`. Cada uno recibe inputs tipados, no strings mágicos.

### Nivel 2 — ui-kit interno (con más proyectos)

Cuando el mismo componente se necesita en un segundo proyecto del monorepo, se mueve a `shared/ui/` con su propio barrel export:

```
shared/
└── ui/
    ├── form-field/         # label + input + error message unidos
    ├── data-table/         # wrapper de p-table con configuración estándar
    ├── page-header/        # título + breadcrumb + acciones
    └── index.ts            # barrel export
```

### Nivel 3 — paquete publicado (con 3+ proyectos consumiendo)

Recién ahí vale configurar un paquete con `ng-packagr` o moverlo a un workspace de Nx. Antes de ese punto es optimización prematura.

**Regla que mantiene esto sano:** un componente entra a `shared/` solo cuando se usa en 2 o más features distintas. Si solo lo usa automotores, vive en automotores.

---

## 3. Convenciones de formularios, validadores y manejo de errores

### Validadores

Todos los validadores son funciones puras que devuelven `ValidatorFn`. Nunca clases, nunca métodos de instancia. Esto los hace testeables con una línea:

```typescript
expect(cuitValidator(control)).toBeNull();           // válido
expect(cuitValidator(control)).toEqual({ cuit: true }); // inválido
```

Se agrupan en un barrel `shared/validators/index.ts` y se documentan con JSDoc indicando el formato esperado y el error key que devuelven. La clave del error es el contrato entre el validador y el componente de mensaje de error.

### Mensajes de error

Un único `ErrorMessageComponent` centralizado con un mapa de error keys a mensajes:

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  required: 'Este campo es obligatorio.',
  cuit: 'El CUIT ingresado no es válido.',
  dominio: 'Formato de dominio inválido (ej: ABC123).',
  minlength: 'Mínimo {requiredLength} caracteres.',
};
```

El componente recibe el `AbstractControl` y renderiza el primer error activo. Nadie más en la app escribe strings de error.

### Manejo de errores HTTP

El `ErrorInterceptor` en `core/` captura todos los errores HTTP y los mapea a un `AppError` tipado antes de que lleguen a los componentes. Los errores 422 (validación server-side) se mapean campo a campo al `FormGroup` correspondiente vía el facade. El componente nunca sabe si el error vino del validador local o del backend.

---

## 4. Estrategia de observabilidad frontend

El objetivo es responder tres preguntas: ¿qué tan rápido carga? ¿qué errores están viendo los usuarios? ¿dónde están perdiendo tiempo?

### Web Vitals

Angular 20 permite medir Core Web Vitals con la Web Vitals library de Google directamente en `app.config.ts`. Las métricas clave para este tipo de app:

| Métrica | Qué mide en esta app |
|---|---|
| LCP | Velocidad de carga del listado de automotores |
| CLS | Estabilidad del layout con skeleton loaders |
| INP | Respuesta a interacciones en formularios |

Se reportan a un endpoint propio o a una herramienta como Datadog RUM o Sentry Performance.

### Errores JS

Un `ErrorHandler` global de Angular que captura excepciones no manejadas y las envía a Sentry o equivalente. Lo importante es que incluya contexto: ruta activa y últimas acciones. Sin contexto, los errores son inútiles.

```typescript
@Injectable()
class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    Sentry.captureException(error, { extra: { route: this.router.url } });
  }
}
```

### Trazas

Un interceptor HTTP que agrega un `X-Trace-Id` a cada request, generado en el cliente. Esto permite correlacionar un error frontend con el log de backend correspondiente. Sin esto, cuando algo falla en producción no sabés qué request del backend corresponde a qué acción del usuario.

### Logging estructurado

En desarrollo, un `LoggingInterceptor` que loguea cada request/response con duración. En producción, solo errores y eventos de negocio relevantes (alta de automotor exitosa, fallo de validación server-side). Nunca datos sensibles en logs.

---

## 5. Plan de evolución

### i18n

Angular tiene soporte nativo con `@angular/localize`. La decisión de arquitectura más importante no es qué librería usar sino **no hardcodear strings en templates desde el principio**. Todos los textos visibles al usuario en un archivo de mensajes o constantes desde el día uno hace que agregar un segundo idioma sea un trabajo de traducción, no de refactoring.

### Feature flags

Un `FeatureFlagService` simple basado en variables de entorno para empezar:

```typescript
isEnabled(flag: string): boolean {
  return this.env.featureFlags[flag] ?? false;
}
```

Se consume con una directiva `*featureFlag="'nueva-feature'"` en templates. Cuando el volumen de flags crece, se integra con una herramienta externa como LaunchDarkly o Growthbook. La interfaz del servicio no cambia, solo la fuente de datos.

### Design tokens

Tailwind ya es un sistema de tokens implícito. El paso siguiente es extraer los valores del proyecto (colores de marca, tipografía, espaciados) a `tailwind.config.js` como extensiones del tema, no como valores inline. Esto separa "el color primario de la empresa" de "blue-500". Si el diseño cambia, cambia un valor en config, no 200 clases en templates.

### CI quality gates

Cuatro gates que no se negocian para mergear a main:

```
✅ Build sin errores TypeScript strict
✅ Unit tests pasan (cobertura mínima en validators y services críticos)
✅ Lighthouse score > 85 en performance y accesibilidad
✅ Bundle size < 250KB gzip (main chunk)
```

El gate de bundle size es el más ignorado y el más importante: sin él, las dependencias crecen silenciosamente hasta que la app se vuelve lenta en producción. Se implementa con el `budget` nativo de Angular en `angular.json`:

```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "200kb",
    "maximumError": "250kb"
  }
]
```

---

## Decisiones pendientes / próximos pasos

Con más tiempo y un scope mayor, las siguientes evoluciones naturales del sistema serían:

- **DTOs compartidos vía workspace:** mover los tipos de `CreateAutomotorDto` y `CreateSujetoDto` a una carpeta `shared/dtos/` en la raíz del monorepo, consumida tanto por frontend como backend. Elimina la desincronización silenciosa entre lo que el frontend envía y lo que el backend valida.
- **npm/pnpm workspaces:** habilitar el workspace root para poder importar `@challenge/shared` desde ambas apps sin paths relativos.
- **Nx o Turborepo:** agregar gestión de monorepo cuando el número de proyectos justifique build cache y `affected` commands.
- **SignalStore:** evaluar su adopción si el estado de la app crece en complejidad. La arquitectura de servicios actual migra sin fricción.
- **Storybook:** documentar los componentes de `shared/ui/` con stories, especialmente una vez que exista el ui-kit interno.
# jestr-activity-tracking-app

Aplicación frontend construida con Angular 19 (standalone components) para gestionar actividades de equipo. Consume la API REST `jestr-activity-tracking-api`.

## Ruta local
`C:\Users\alejb\source\repos\Alejb2001\jestr-activity-tracking-app`

## Stack
- Angular 19 (standalone components, sin NgModules)
- TypeScript
- Reactive Forms (`@angular/forms`)
- HttpClient (`@angular/common/http`)
- Bootstrap 5 (estilos y componentes UI)
- RxJS (manejo de observables)

## Estructura de carpetas

```
src/
├── environments/
│   └── environment.ts              URL base de la API
└── app/
    ├── app.component.ts/html       Shell con <router-outlet>
    ├── app.config.ts               provideRouter + provideHttpClient
    ├── app.routes.ts               Rutas con lazy loading
    ├── core/
    │   ├── models/
    │   │   └── activity.model.ts   Interfaces, enum ActivityStatus, labels
    │   └── services/
    │       └── activity.service.ts HttpClient — 5 métodos CRUD
    └── features/
        └── activities/
            ├── activity-list/      Vista de tabla con todas las actividades
            └── activity-form/      Formulario para crear y editar
```

## Configuración de entorno

**`src/environments/environment.ts`**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```
Para producción se debe crear `environment.production.ts` con la URL real.

## Modelo (`core/models/activity.model.ts`)

```typescript
enum ActivityStatus { Pending=0, InProgress=1, Completed=2, Cancelled=3 }

interface Activity {
  id, title, description, scheduledStart, scheduledEnd,
  status, statusLabel, assignedUserId, createdAt, updatedAt?
}

interface CreateActivityPayload { title, description, scheduledStart, scheduledEnd, assignedUserId }
interface UpdateActivityPayload extends CreateActivityPayload { status }
```

`ActivityStatusLabels` mapea el enum a texto en español: Pendiente / En Progreso / Completada / Cancelada.

## Servicio (`core/services/activity.service.ts`)

`providedIn: 'root'` — singleton global.

| Método | HTTP | Endpoint |
|---|---|---|
| `getAll()` | GET | `/api/activities` |
| `getById(id)` | GET | `/api/activities/{id}` |
| `create(payload)` | POST | `/api/activities` |
| `update(id, payload)` | PUT | `/api/activities/{id}` |
| `delete(id)` | DELETE | `/api/activities/{id}` |

Todos retornan `Observable<T>`.

## Rutas (`app.routes.ts`)

| URL | Componente | Descripción |
|---|---|---|
| `/` | redirect | Redirige a `/activities` |
| `/activities` | `ActivityListComponent` | Tabla de actividades |
| `/activities/new` | `ActivityFormComponent` | Formulario crear |
| `/activities/:id/edit` | `ActivityFormComponent` | Formulario editar |

Todos los componentes se cargan con **lazy loading** (`loadComponent`).

## Componentes

### ActivityListComponent (`features/activities/activity-list/`)
- Carga actividades en `ngOnInit()` via `ActivityService.getAll()`
- Muestra tabla con: Título, Responsable, Inicio, Conclusión, Estado, Acciones
- Estado representado con badge Bootstrap coloreado según el valor del enum
- Botón "Editar" → navega a `/activities/:id/edit`
- Botón "Eliminar" → confirm() → `delete()` → filtra el array local
- Maneja estados: `loading` (spinner) y `error` (alert)

### ActivityFormComponent (`features/activities/activity-form/`)
- Modo doble: **crear** (ruta `/new`) y **editar** (ruta `/:id/edit`)
- En modo editar: detecta el `id` de la ruta, llama `getById()` y hace `patchValue()`
- Validaciones por campo:
  - `title`: required, minLength(3), maxLength(100)
  - `description`: required, maxLength(500)
  - `scheduledStart`: required
  - `scheduledEnd`: required
  - `assignedUserId`: required, maxLength(100)
- Validador de grupo `scheduledDateRangeValidator`: la fecha fin debe ser posterior a la inicio
- El campo `status` solo aparece en modo editar
- Al guardar exitosamente navega a `/activities`

## Bootstrap 5
Instalado via npm. Registrado en `angular.json`:
```json
"styles": ["node_modules/bootstrap/dist/css/bootstrap.min.css", "src/styles.css"],
"scripts": ["node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"]
```

## Cómo ejecutar
```bash
cd C:\Users\alejb\source\repos\Alejb2001\jestr-activity-tracking-app
ng serve
```
Disponible en: `http://localhost:4200`

El backend debe estar corriendo en `http://localhost:5000` para que las peticiones funcionen.

## Pendientes
- [ ] Agregar `environment.production.ts` con URL de producción
- [ ] Reemplazar `assignedUserId` (texto libre) por un dropdown que cargue usuarios desde la API
- [ ] Agregar filtros y búsqueda en el listado
- [ ] Agregar paginación en la tabla
- [ ] Manejo global de errores HTTP con un interceptor
- [ ] Agregar autenticación (guard de rutas + token JWT)

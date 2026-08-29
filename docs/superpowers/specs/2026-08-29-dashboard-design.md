# Dashboard de Estadísticas — Spec de Diseño

**Fecha:** 2026-08-29
**Proyecto:** Jestr Activity Tracking App
**Estado:** Aprobado

---

## 1. Objetivo

Agregar un módulo Dashboard que muestre un resumen de estadísticas de actividades. El dashboard es útil tanto para administradores de empresa (vista de equipo) como para empleados (vista personal). Ofrece filtrado por rango de fechas y permite ver el detalle por usuario con expansión en la tabla.

---

## 2. Arquitectura

### Estrategia general

- **Un solo endpoint backend** `GET /api/dashboard/stats?from=&to=` que devuelve todos los datos en una sola respuesta.
- **Lazy loading de actividades por usuario**: las actividades individuales de un usuario se cargan desde el endpoint existente de actividades (filtrado por `userId`), solo cuando el usuario expande esa fila en la tabla. No se incluyen en la respuesta del endpoint principal.
- El componente frontend llama al endpoint principal al cargar y al cambiar el filtro de fechas.

### Scoping multi-tenant

- Usuarios con rol `admin` (global): ven todas las actividades de la plataforma.
- Usuarios con rol `company_admin` o `company_viewer`: ven solo actividades de su empresa (filtradas por `company_id` extraído del JWT).

### Archivo de ruta

El componente se registra con `loadComponent` (lazy) en el router existente del proyecto.

---

## 3. Backend

### Endpoint

```
GET /api/dashboard/stats?from={date}&to={date}
```

- `from` y `to` son opcionales. Si se omiten, el backend usa el mes actual (1ro del mes hasta hoy).
- Requiere autenticación (JWT Bearer). El tenant se extrae del claim `company_id`.
- Implementado en `DashboardController.cs` en la capa `Api`.

### DTO de respuesta: `DashboardStatsDto`

```json
{
  "summary": {
    "total": 0,
    "pending": 0,
    "inProgress": 0,
    "completed": 0,
    "cancelled": 0,
    "completionRate": 0.0,
    "onTimeRate": 0.0,
    "overdue": 0
  },
  "byPriority": {
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "byUser": [
    {
      "userId": 0,
      "userName": "",
      "total": 0,
      "completed": 0,
      "inProgress": 0,
      "pending": 0,
      "cancelled": 0,
      "completionRate": 0.0,
      "overdue": 0
    }
  ]
}
```

**Definiciones:**
- `completionRate`: `completed / total * 100` (0 si total = 0)
- `onTimeRate`: porcentaje de actividades completadas antes de su fecha de vencimiento
- `overdue`: actividades no completadas cuya fecha de vencimiento ya pasó
- `byUser` es un arreglo vacío `[]` si el usuario autenticado es `company_viewer`

### Capas involucradas

| Capa | Artefacto nuevo |
|------|-----------------|
| Application/DTOs | `DashboardStatsDto.cs` |
| Application/Interfaces | `IDashboardService.cs` |
| Application/Services | `DashboardService.cs` |
| Api/Controllers | `DashboardController.cs` |
| Infrastructure/Extensions | Registrar `IDashboardService` en DI |

El `DashboardService` consulta directamente el `AppDbContext` (o a través de un repositorio de actividades existente) con LINQ y proyecciones — sin agregar un repositorio nuevo si el acceso existente es suficiente.

---

## 4. Frontend

### Ubicación

```
src/app/features/dashboard/
  dashboard.component.ts
  dashboard.component.html
```

### Ruta

```typescript
{ path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] }
```

### Servicio

```
src/app/core/services/dashboard.service.ts
```

Método: `getStats(from?: string, to?: string): Observable<DashboardStatsDto>`

### Layout del componente (de arriba a abajo)

#### Header row
- Título "Dashboard"
- Quick selectors de rango: `Hoy | Esta semana | Este mes | Este año`
- Date picker de rango personalizado: dos `<input type="date">` (Desde / Hasta)
- Solo muestra selector de vista (Empresa / Personal) si el usuario es `company_admin` o `admin` — aunque en realidad la vista se determina automáticamente por el rol

#### KPI cards (fila Bootstrap `row-cols-2 row-cols-md-4`)
| Tarjeta | Color badge |
|---------|-------------|
| Total | Gris |
| Completadas | Verde |
| En progreso | Azul |
| Pendientes | Amarillo |

#### Fila secundaria (2 columnas)
- **Columna izquierda (col-md-4):** Distribución por prioridad — 3 barras CSS horizontales (Alta / Media / Baja) con número y porcentaje. Barras implementadas con `<div [style.width.%]="pct">` — sin librerías de gráficos.
- **Columna derecha (col-md-8):** Métricas de calidad — tarjetas pequeñas para Tasa de completación (%), Tareas vencidas, Tasa a tiempo (%).

#### Tabla de usuarios
- Visible solo para `admin` y `company_admin`.
- Columnas: Avatar (inicial del nombre), Nombre, Total, Completadas, En progreso, Pendientes, % completación, Vencidas.
- Al hacer clic en una fila: se expande debajo (acordeón) con las actividades individuales de ese usuario, cargadas en ese momento desde el endpoint existente de actividades con `?userId=X&from=&to=`.
- Solo una fila expandida a la vez. Clic de nuevo la colapsa.

**Vista empleado (`company_viewer`):** El mismo componente sin la tabla de usuarios. Solo KPIs y distribuciones de sus propias actividades.

---

## 5. Sidebar

Se agrega el enlace "Dashboard" en `navbar.component.html`, visible para todos los usuarios autenticados, ubicado antes del enlace "Actividades". Icono: ícono de gráfico de barras Bootstrap Icons (`bi-bar-chart-line`).

---

## 6. Estado del filtro

- Los parámetros de fecha se guardan en memoria del componente (variables de instancia).
- Al cargar el dashboard, el rango predeterminado es "Este mes" (1ro del mes actual → hoy).
- Al navegar fuera y volver, el filtro se resetea al valor predeterminado.
- No se persiste en URL ni en localStorage.

---

## 7. Manejo de errores

- Si el endpoint falla, se muestra un mensaje de error inline (alerta Bootstrap `alert-danger`) con opción de reintentar.
- Mientras carga, se muestran skeleton placeholders (divs con clase `placeholder` de Bootstrap 5).

---

## 8. Checklist de implementación

### Backend
- [ ] `DashboardStatsDto.cs` en Application/DTOs
- [ ] `IDashboardService.cs` en Application/Interfaces
- [ ] `DashboardService.cs` en Application/Services (cálculo de métricas con LINQ)
- [ ] `DashboardController.cs` en Api/Controllers
- [ ] Registrar servicio en `InfrastructureServiceExtensions.cs` o `Program.cs`

### Frontend
- [ ] `dashboard.service.ts` en core/services
- [ ] Modelos TS para `DashboardStatsDto`
- [ ] `dashboard.component.ts` + `.html`
- [ ] Ruta `/dashboard` en el router
- [ ] Enlace "Dashboard" en sidebar (navbar.component.html)

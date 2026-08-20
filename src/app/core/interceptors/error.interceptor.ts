import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

const ERROR_MESSAGES: Record<number, string> = {
  0:   'Sin conexi\u00f3n. Verifica tu red.',
  400: 'Datos inv\u00e1lidos. Revisa el formulario.',
  401: 'Sesi\u00f3n expirada. Inicia sesi\u00f3n nuevamente.',
  403: 'No tienes permisos para esta acci\u00f3n.',
  404: 'El recurso solicitado no existe.',
  409: 'Conflicto: el registro ya existe.',
  422: 'Los datos enviados no son procesables.',
  500: 'Error en el servidor. Int\u00e9ntalo m\u00e1s tarde.',
  503: 'Servicio no disponible. Int\u00e9ntalo m\u00e1s tarde.'
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = ERROR_MESSAGES[error.status]
        ?? `Error inesperado (${error.status}).`;

      notifications.error(message);
      console.error(`[HTTP ${error.status}] ${req.method} ${req.url}`, error);

      return throwError(() => error);
    })
  );
};

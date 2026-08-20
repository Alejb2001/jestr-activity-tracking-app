import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 0;
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, type: ToastType = 'info', duration = 5000): void {
    const toast: Toast = { id: this.nextId++, message, type };
    this._toasts.update(list => [...list, toast]);
    setTimeout(() => this.remove(toast.id), duration);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string):   void { this.show(message, 'danger');  }
  warning(message: string): void { this.show(message, 'warning'); }
  info(message: string):    void { this.show(message, 'info');    }

  remove(id: number): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }
}

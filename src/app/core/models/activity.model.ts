export enum ActivityStatus {
  Pending    = 0,
  InProgress = 1,
  Completed  = 2,
  Cancelled  = 3
}

export const ActivityStatusLabels: Record<ActivityStatus, string> = {
  [ActivityStatus.Pending]:    'Pendiente',
  [ActivityStatus.InProgress]: 'En Progreso',
  [ActivityStatus.Completed]:  'Completada',
  [ActivityStatus.Cancelled]:  'Cancelada'
};

export enum ActivityPriority {
  Low    = 0,
  Medium = 1,
  High   = 2
}

export const ActivityPriorityLabels: Record<ActivityPriority, string> = {
  [ActivityPriority.Low]:    'Baja',
  [ActivityPriority.Medium]: 'Media',
  [ActivityPriority.High]:   'Alta'
};

export interface Activity {
  id: number;
  title: string;
  description: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: ActivityStatus;
  statusLabel: string;
  priority: ActivityPriority;
  assignedUserId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateActivityPayload {
  title: string;
  description: string;
  scheduledStart: string;
  scheduledEnd: string;
  assignedUserId: string;
  priority?: ActivityPriority;
}

export interface UpdateActivityPayload extends CreateActivityPayload {
  status: ActivityStatus;
  priority: ActivityPriority;
}

export interface ActivityQueryParams {
  status?: ActivityStatus | null;
  assignedUserId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

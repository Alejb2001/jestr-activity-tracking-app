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

export interface Activity {
  id: number;
  title: string;
  description: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: ActivityStatus;
  statusLabel: string;
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
}

export interface UpdateActivityPayload extends CreateActivityPayload {
  status: ActivityStatus;
}

export interface DashboardSummary {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  completionRate: number;
  onTimeRate: number;
  overdue: number;
}

export interface DashboardByPriority {
  high: number;
  medium: number;
  low: number;
}

export interface DashboardUserStats {
  userId: string;
  userName: string;
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  cancelled: number;
  completionRate: number;
  overdue: number;
}

export interface DashboardStats {
  summary: DashboardSummary;
  byPriority: DashboardByPriority;
  byUser: DashboardUserStats[];
}

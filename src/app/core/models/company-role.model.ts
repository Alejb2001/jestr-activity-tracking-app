export interface CompanyRole {
  id: number;
  name: string;
  permissions: string[];
  isActive: boolean;
}

export interface CreateCompanyRolePayload {
  name: string;
  permissions: string[];
}

export interface UpdateCompanyRolePayload {
  name: string;
  permissions: string[];
  isActive: boolean;
}

export const ALL_PERMISSIONS: { key: string; label: string; group: string }[] = [
  { key: 'activities.view',   label: 'Ver actividades',          group: 'Actividades' },
  { key: 'activities.create', label: 'Crear actividades',        group: 'Actividades' },
  { key: 'activities.edit',   label: 'Editar actividades',       group: 'Actividades' },
  { key: 'activities.status', label: 'Cambiar estado',           group: 'Actividades' },
  { key: 'planning.view',     label: 'Ver planificación',        group: 'Planificación' },
  { key: 'planning.edit',     label: 'Editar planificación',     group: 'Planificación' },
  { key: 'users.view',        label: 'Ver usuarios',             group: 'Usuarios' },
  { key: 'users.create',      label: 'Crear usuarios',           group: 'Usuarios' },
  { key: 'users.edit',        label: 'Editar usuarios',          group: 'Usuarios' },
  { key: 'users.deactivate',  label: 'Desactivar usuarios',      group: 'Usuarios' },
];

export const PERMISSION_GROUPS = [...new Set(ALL_PERMISSIONS.map(p => p.group))];

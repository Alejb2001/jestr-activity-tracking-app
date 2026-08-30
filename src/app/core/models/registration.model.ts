export type RegistrationStatus = 'Pending' | 'Approved' | 'Rejected';

export const RegistrationStatusLabel: Record<RegistrationStatus, string> = {
  Pending:  'Pendiente',
  Approved: 'Aprobada',
  Rejected: 'Rechazada'
};

export interface Registration {
  id: number;
  companyName: string;
  companyCode: string;
  contactName: string;
  contactEmail: string;
  adminUsername: string;
  status: RegistrationStatus;
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface CreateRegistrationPayload {
  companyName: string;
  companyCode: string;
  contactName: string;
  contactEmail: string;
  adminUsername: string;
  adminPassword: string;
}

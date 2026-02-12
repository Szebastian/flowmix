export type MembershipLevel = 'apoyo' | 'interno' | 'socio';
export type MembershipStatus = 'active' | 'pending' | 'pending_verification' | 'expired' | 'cancelled' | 'rejected';

export interface Membership {
  id?: string;
  userId: string;
  level: MembershipLevel;
  status: MembershipStatus;
  startDate?: Date | string;
  receiptUrl?: string;
  transactionRef?: string;
  internalNotes?: string;
  monthsPaid?: number;
  expiryDate?: Date | string;
}

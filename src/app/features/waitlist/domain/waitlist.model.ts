export interface WaitlistPosition {
  userId: string;
  djName: string;
  email: string;
  position: number;
  totalParticipants?: number;
  totalEntries: number; // Deprecated: Mantener por compatibilidad con Admin/Core
  percentile?: number;
  joinedAt: Date;
  country?: string;
  genre?: string;
  referral?: string;
  consentMarketing?: boolean;
  gender?: string;
  nationality?: string;
  os?: string;
  osVersion?: string;
  architecture?: string;
  currentSoftware?: string;
  audioFormats?: string[];
  interests?: string[];
  userName?: string;
  instagram?: string;
  status?: string;
}

export interface JoinWaitlistRequest {
  djName: string;
  email: string;
  country?: string;
  genre?: string;
  referral?: string;
  consentMarketing?: boolean;
  gender?: string;
  // New fields
  userName?: string;
  nationality?: string;
  instagram?: string;
  os?: string;
  osVersion?: string;
  architecture?: string;
  currentSoftware?: string;
  audioFormats?: string[];
  interests?: string[];
  status?: string;
}

export interface WaitlistRankingResponse {
  position: number;
  totalParticipants?: number;
  percentile?: number;
}

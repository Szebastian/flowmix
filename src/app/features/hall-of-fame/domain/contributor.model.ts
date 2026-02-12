export interface Contributor {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  tier: 'partner' | 'insider' | 'supporter';
  badges: ContributorBadge[];
  verifiedAt: Date;
  contributions: number;
}

export interface ContributorBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface ContributorResponse {
  partners: Contributor[];
  insiders: Contributor[];
  supporters: Contributor[];
}

import { Injectable } from '@angular/core';
import { ContributorRepository } from '../domain/contributor.repository';
import { Contributor, ContributorResponse } from '../domain/contributor.model';

@Injectable({
  providedIn: 'root',
})
export class ApiContributorAdapter extends ContributorRepository {
  constructor() {
    super();
  }

  async getContributors(): Promise<ContributorResponse> {
    // Mock implementation
    return {
      partners: await this.getPartners(),
      insiders: await this.getInsiders(),
      supporters: await this.getSupporters(),
    };
  }

  async getPartners(): Promise<Contributor[]> {
    // Mock implementation
    return [
      {
        id: 'partner_1',
        username: '@DJ_ELITE',
        displayName: 'DJ ELITE',
        tier: 'partner',
        badges: [
          {
            id: 'founding',
            name: 'Founding Donor',
            icon: 'diamond',
            description: 'Donante Fundador',
          },
          {
            id: 'feedback',
            name: 'Feedback Hero',
            icon: 'terminal',
            description: 'Héroe del Feedback',
          },
        ],
        verifiedAt: new Date('2024-01-01'),
        contributions: 150,
      },
      {
        id: 'partner_2',
        username: '@TECH_TITAN',
        displayName: 'TECH TITAN',
        tier: 'partner',
        badges: [
          {
            id: 'code',
            name: 'Code Contributor',
            icon: 'code',
            description: 'Colaborador de Código',
          },
          {
            id: 'feedback',
            name: 'Feedback Hero',
            icon: 'terminal',
            description: 'Héroe del Feedback',
          },
        ],
        verifiedAt: new Date('2024-01-15'),
        contributions: 145,
      },
    ];
  }

  async getInsiders(): Promise<Contributor[]> {
    // Mock implementation
    return [
      {
        id: 'insider_1',
        username: '@ALEX_STREAM',
        displayName: 'ALEX STREAM',
        tier: 'insider',
        badges: [],
        verifiedAt: new Date('2024-06-01'),
        contributions: 75,
      },
      {
        id: 'insider_2',
        username: '@NEON_CORE',
        displayName: 'NEON CORE',
        tier: 'insider',
        badges: [],
        verifiedAt: new Date('2024-06-15'),
        contributions: 70,
      },
      {
        id: 'insider_3',
        username: '@CYBER_JOCKEY',
        displayName: 'CYBER JOCKEY',
        tier: 'insider',
        badges: [],
        verifiedAt: new Date('2024-07-01'),
        contributions: 65,
      },
    ];
  }

  async getSupporters(): Promise<Contributor[]> {
    // Mock implementation
    return [
      {
        id: 'supporter_1',
        username: '@JUAN_FLOW',
        displayName: 'JUAN FLOW',
        tier: 'supporter',
        badges: [],
        verifiedAt: new Date('2024-09-01'),
        contributions: 30,
      },
      {
        id: 'supporter_2',
        username: '@CODE_DJ',
        displayName: 'CODE DJ',
        tier: 'supporter',
        badges: [],
        verifiedAt: new Date('2024-09-15'),
        contributions: 25,
      },
      {
        id: 'supporter_3',
        username: '@BEAT_MASTER',
        displayName: 'BEAT MASTER',
        tier: 'supporter',
        badges: [],
        verifiedAt: new Date('2024-10-01'),
        contributions: 20,
      },
    ];
  }
}

import { Injectable } from '@angular/core';
import { Contributor, ContributorResponse } from './contributor.model';

@Injectable({
  providedIn: 'root',
})
export abstract class ContributorRepository {
  abstract getContributors(): Promise<ContributorResponse>;

  abstract getPartners(): Promise<Contributor[]>;

  abstract getInsiders(): Promise<Contributor[]>;

  abstract getSupporters(): Promise<Contributor[]>;
}

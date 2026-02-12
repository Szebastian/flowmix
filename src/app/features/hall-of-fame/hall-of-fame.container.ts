import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '@app/core/i18n/i18n-service';
import { GetContributorsUseCase } from './application/get-contributors.use-case';
import { ApiContributorAdapter } from './infrastructure/api-contributor.adapter';
import { SupabaseContributorAdapter } from '@features/hall-of-fame/infrastructure/supabase-contributor.adapter';
import { ContributorRepository } from './domain/contributor.repository';
import { PartnerCardComponent } from './infrastructure/ui/partner-card/partner-card.component';
import { SupporterGridComponent } from '@app/features/hall-of-fame/infrastructure/ui/supporter-grid/supporter-grid.component';
import { UserCardComponent } from '@app/shared/components/user-card.component';
import { ShareImageService } from '@app/shared/services/share-image.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-hall-of-fame-container',
  standalone: true,
  imports: [CommonModule, PartnerCardComponent, SupporterGridComponent, UserCardComponent],
  providers: [
    { provide: ContributorRepository, useClass: SupabaseContributorAdapter },
    GetContributorsUseCase,
  ],
  template: `
    <section class="w-full mt-16 lg:mt-24" id="hall-of-fame">
      <div class="max-w-[1440px] mx-auto px-4 md:px-8 space-y-[100px]">
        <header class="text-center space-y-4">
          <h2 class="text-5xl font-black monotech uppercase tracking-tighter">
            {{ rankedContributorsLabel }} <br />
            <span class="text-white/20 text-3xl">{{ hallOfFameLabel }}</span>
          </h2>
          <p class="monotech text-[10px] text-white/40 uppercase tracking-[0.3em]">
            {{ recognizingEliteLabel }}
          </p>
        </header>

        <!-- PARTNERS TIER -->
        @if (getContributors.contributors()?.partners?.length) {
          <div class="space-y-12">
          <div class="bg-black/40 border border-white/5 px-6 py-4 rounded-xl flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-partner text-2xl">diamond</span>
              <h3 class="text-xl font-bold monotech uppercase tracking-[0.2em] text-white">
                {{ partnersLabel }}
              </h3>
            </div>
            <span class="monotech text-[10px] text-white/40 uppercase tracking-widest font-bold px-3 py-1 border border-white/10 rounded-full bg-white/5"
              >{{ tier01Label }}</span
            >
          </div>
          <div class="grid gap-8" style="grid-template-columns: repeat(auto-fit, minmax(350px, 1fr))">
            @for (partner of getContributors.contributors()?.partners; track partner) {
              <app-partner-card 
                [contributor]="partner" 
                class="h-full w-full"
              />
            }
          </div>
          </div>
        }

        <!-- INSIDERS TIER -->
        @if (getContributors.contributors()?.insiders?.length) {
          <div class="space-y-12">
          <div class="bg-black/40 border border-white/5 px-6 py-4 rounded-xl flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-insider text-2xl">verified</span>
              <h3 class="text-xl font-bold monotech uppercase tracking-[0.2em] text-white">
                {{ insidersLabel }}
              </h3>
            </div>
            <span class="monotech text-[10px] text-white/40 uppercase tracking-widest font-bold px-3 py-1 border border-white/10 rounded-full bg-white/5"
              >{{ tier02Label }}</span
            >
          </div>
          <div class="grid gap-8" style="grid-template-columns: repeat(auto-fit, minmax(350px, 1fr))">
            @for (insider of getContributors.contributors()?.insiders || []; track insider) {
                <div class="relative">
                  <app-user-card 
                      [name]="insider.username" 
                      [role]="betaSpecialistLabel"
                      [imageUrl]="insider.avatar"
                      variant="insider"
                      layout="vertical"
                      class="h-full block"
                  ></app-user-card>
                  <div class="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
                    <button type="button"
                            class="w-8 h-8 rounded-full border border-insider/30 bg-black/40 hover:bg-insider/20 text-white/70 hover:text-white transition-all duration-300 flex items-center justify-center group/btn focus:outline-none focus:ring-2 focus:ring-insider/50"
                            [disabled]="isSharing(insider)"
                            [attr.aria-expanded]="menuOpenFor(insider) ? 'true' : 'false'"
                            [attr.aria-label]="menuOpenFor(insider) ? 'Cerrar opciones de compartir' : 'Abrir opciones de compartir'"
                            (click)="toggleInsiderMenu(insider)"
                            (keyup.enter)="toggleInsiderMenu(insider)">
                       @if (isSharing(insider)) {
                         <span class="inline-block w-3 h-3 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></span>
                       } @else {
                         <span class="material-symbols-outlined text-[16px] group-hover/btn:scale-110 transition-transform">share</span>
                       }
                    </button>
                    
                    @if (menuOpenFor(insider)) {
                      <div class="glass border border-white/10 rounded-lg overflow-hidden shadow-xl animate-fade-in-down origin-top-right flex flex-col min-w-[140px]">
                        <button type="button"
                                class="flex items-center gap-2 w-full text-left text-[10px] monotech uppercase tracking-widest px-3 py-2 hover:bg-insider/10 text-white/80 hover:text-white focus:outline-none transition-colors border-b border-white/5"
                                [disabled]="isSharing(insider)"
                                (click)="shareInsiderOg(insider)"
                                (keyup.enter)="shareInsiderOg(insider)">
                          <span class="material-symbols-outlined text-[14px]">image</span>
                          <span>Post (OG)</span>
                        </button>
                        <button type="button"
                                class="flex items-center gap-2 w-full text-left text-[10px] monotech uppercase tracking-widest px-3 py-2 hover:bg-insider/10 text-white/80 hover:text-white focus:outline-none transition-colors"
                                [disabled]="isSharing(insider)"
                                (click)="shareInsiderStory(insider)"
                                (keyup.enter)="shareInsiderStory(insider)">
                          <span class="material-symbols-outlined text-[14px]">amp_stories</span>
                          <span>Story</span>
                        </button>
                      </div>
                    }
                  </div>
                </div>
            }
          </div>
          </div>
        }

        <!-- SUPPORTERS TIER -->
        @if (getContributors.contributors()?.supporters?.length) {
          <div class="space-y-12">
          <div class="bg-black/40 border border-white/5 px-6 py-4 rounded-xl flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-supporter text-2xl">volunteer_activism</span>
              <h3 class="text-xl font-bold monotech uppercase tracking-[0.2em] text-white">
                {{ supportersLabel }}
              </h3>
            </div>
            <span class="monotech text-[10px] text-white/40 uppercase tracking-widest font-bold px-3 py-1 border border-white/10 rounded-full bg-white/5"
              >{{ tier03Label }}</span
            >
          </div>

          <app-supporter-grid [supporters]="getContributors.contributors()?.supporters || []" />
          </div>
        }

        @if (!getContributors.loading() && 
             !getContributors.contributors()?.partners?.length && 
             !getContributors.contributors()?.insiders?.length && 
             !getContributors.contributors()?.supporters?.length) {
          <div class="text-center py-24 space-y-6 animate-in fade-in duration-700">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-4">
              <span class="material-symbols-outlined text-4xl text-white/20">diversity_2</span>
            </div>
            <div class="space-y-2">
              <p class="monotech text-white/60 uppercase tracking-[0.2em] font-bold">
                {{ emptyTitleLabel }}
              </p>
              <p class="text-white/40 text-sm max-w-md mx-auto">
                {{ emptyDescLabel }}
              </p>
            </div>
          </div>
        }

        @if (getContributors.loading()) {
          <div class="text-center text-white/40 py-12">
            <span class="monotech">{{ loadingLabel }}</span>
          </div>
        }
      </div>
    </section>
  `,
  styles: [],
})
export class HallOfFameContainerComponent implements OnInit {
  getContributors = inject(GetContributorsUseCase);
  private readonly i18n = inject(I18nService);
  private readonly share = inject(ShareImageService);
  language = this.i18n.language;
  private readonly sharingIds = signal<Set<string>>(new Set<string>());
  private readonly menuIds = signal<Set<string>>(new Set<string>());

  get rankedContributorsLabel(): string {
    return this.i18n.get('RANKED_CONTRIBUTORS');
  }

  get hallOfFameLabel(): string {
    return this.i18n.get('HALL_OF_FAME');
  }

  get recognizingEliteLabel(): string {
    return this.i18n.get('RECOGNIZING_ELITE');
  }

  get partnersLabel(): string {
    return this.i18n.get('PARTNERS');
  }

  get tier01Label(): string {
    return this.i18n.get('TIER_01');
  }

  get insidersLabel(): string {
    return this.i18n.get('INSIDERS');
  }

  get tier02Label(): string {
    return this.i18n.get('TIER_02');
  }

  get betaSpecialistLabel(): string {
    return this.i18n.get('BETA_FEEDBACK_SPECIALIST');
  }

  get loadingLabel(): string {
    return this.i18n.get('LOADING_CONTRIBUTORS');
  }

  get supportersLabel(): string {
    return this.language() === 'en' ? 'COLLABORATORS' : 'COLABORADORES';
  }

  get tier03Label(): string {
    return this.language() === 'en' ? 'Tier 03' : 'Nivel 03';
  }

  get emptyTitleLabel(): string {
    return this.language() === 'en' ? 'NO MEMBERS YET' : 'AÚN NO HAY MIEMBROS';
  }

  get emptyDescLabel(): string {
    return this.language() === 'en' 
      ? 'Be the first to join the elite group of contributors.' 
      : 'Sé el primero en unirte al grupo de élite de colaboradores.';
  }

  ngOnInit(): void {
    this.getContributors.execute();
  }
  isSharing(insider: any): boolean {
    const id = insider?.username || '';
    return id ? this.sharingIds().has(id) : false;
  }
  menuOpenFor(insider: any): boolean {
    const id = insider?.username || '';
    return id ? this.menuIds().has(id) : false;
  }
  toggleInsiderMenu(insider: any) {
    const id = insider?.username || '';
    if (!id) return;
    const set = new Set(this.menuIds());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.menuIds.set(set);
  }
  async shareInsiderOg(insider: any) {
    const key = insider?.username || '';
    const current = new Set(this.sharingIds());
    if (key && current.has(key)) return;
    if (key) {
      current.add(key);
      this.sharingIds.set(current);
    }
    try {
      const dataUrl = await this.share.generateOgImage({
        name: insider.displayName || insider.username,
        avatarUrl: insider.avatar,
        tier: 'insider',
        profileUrl: `${window.location.origin}/hall-of-fame#${encodeURIComponent(insider.username)}`
      });
      await this.share.shareWeb(
        dataUrl,
        `${insider.username}_og.png`,
        'Muro de la Fama · FLOWMIX',
        `¡Orgulloso de ser parte de FLOWMIX como Interno Nivel 02! 🎧 Únete a la comunidad aquí:`,
        `${window.location.origin}/hall-of-fame#${encodeURIComponent(insider.username)}`
      );
      const menu = new Set(this.menuIds());
      menu.delete(key);
      this.menuIds.set(menu);
    } finally {
      if (key) {
        const updated = new Set(this.sharingIds());
        updated.delete(key);
        this.sharingIds.set(updated);
      }
    }
  }
  async shareInsiderStory(insider: any) {
    const key = insider?.username || '';
    const current = new Set(this.sharingIds());
    if (key && current.has(key)) return;
    if (key) {
      current.add(key);
      this.sharingIds.set(current);
    }
    try {
      const dataUrl = await this.share.generateStoryImage({
        name: insider.displayName || insider.username,
        avatarUrl: insider.avatar,
        tier: 'insider',
        profileUrl: `${window.location.origin}/hall-of-fame#${encodeURIComponent(insider.username)}`
      });
      await this.share.shareWeb(
        dataUrl,
        `${insider.username}_story.png`,
        'Muro de la Fama · FLOWMIX',
        `¡Orgulloso de ser parte de FLOWMIX como Interno Nivel 02! 🎧 Únete a la comunidad aquí:`,
        `${window.location.origin}/hall-of-fame#${encodeURIComponent(insider.username)}`
      );
      const menu = new Set(this.menuIds());
      menu.delete(key);
      this.menuIds.set(menu);
    } finally {
      if (key) {
        const updated = new Set(this.sharingIds());
        updated.delete(key);
        this.sharingIds.set(updated);
      }
    }
  }
}

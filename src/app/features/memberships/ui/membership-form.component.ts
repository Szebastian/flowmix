import { Component, inject, signal, computed, OnInit, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '@app/core/i18n/i18n-service';
import { SupabaseService } from '@app/core/integrations/supabase.service';
import { ButtonComponent } from '@app/shared/components/button.component';
import { InputComponent } from '@app/shared/components/input.component';
import { Profile } from '@app/core/domain/models/profile.model';
import { Membership } from '@app/core/domain/models/membership.model';
import { TechnicalData } from '@app/core/domain/models/technical-data.model';
import { COUNTRIES } from '@app/shared/data/countries.data';

type Tier = 'apoyo' | 'interno' | 'socio';

@Component({
  selector: 'app-membership-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="w-full max-w-[860px] mx-auto glass p-6 md:p-8 rounded-2xl border border-white/10 bg-black/40">
      <!-- Top Progress -->
      @if (!success()) {
      <div class="mb-6">
        <div class="flex justify-between text-[10px] monotech text-white/40 uppercase tracking-wider mb-1">
          <span>Paso</span>
          <span>{{ step() }} / 3</span>
        </div>
        <div class="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div class="h-full transition-all duration-500 ease-out" [class]="progressBarClass()" [style.width.%]="progress()"></div>
        </div>
      </div>

      <!-- Steps -->
      <form (ngSubmit)="onSubmit()" novalidate class="space-y-10">
        <!-- Step 1: Identification & Level -->
        @if (step() === 1) {
          <div class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div class="space-y-4">
              <div class="space-y-2">
                <h3 class="text-3xl font-black text-white uppercase tracking-tighter monotech">Identificación</h3>
                <p class="text-white/40 text-sm monotech uppercase tracking-widest">Paso 01 — La puerta de entrada</p>
              </div>

              @if (autoFilled()) {
                <div class="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-4 animate-in zoom-in duration-500">
                  <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-primary">auto_fix_high</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-white">¡Bienvenido de nuevo!</p>
                    <p class="text-[10px] monotech text-primary/70 uppercase tracking-widest">Detectamos tu cuenta. Tu nueva membresía se sumará a tu historial existente.</p>
                  </div>
                </div>
              }
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="relative group">
                <span class="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/20 group-focus-within:text-primary transition-colors z-10" [class.text-partner]="!tier() && showErrors()">workspace_premium</span>
                <select [ngModel]="tier()" (ngModelChange)="tier.set($event)" name="tier" class="w-full h-[64px] bg-transparent border border-white/10 rounded-xl px-4 pl-14 text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none appearance-none cursor-pointer font-mono text-sm pt-4 peer" [class.border-partner]="!tier() && showErrors()" [class.text-partner]="!tier() && showErrors()">
                  <option value="" disabled selected class="bg-[#0a0a0a] text-white/60">Elige tu membresía</option>
                  <option value="apoyo" class="bg-[#0a0a0a]">Nivel 01 — Apoyo</option>
                  <option value="interno" class="bg-[#0a0a0a]">Nivel 02 — Interno</option>
                  <option value="socio" class="bg-[#0a0a0a]">Nivel 03 — Socio</option>
                </select>
                <label class="absolute left-14 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none transition-all duration-200 peer-focus:top-3 peer-focus:text-[10px] peer-focus:text-primary peer-valid:top-3 peer-valid:text-[10px] peer-valid:text-primary" [class.text-partner]="!tier() && showErrors()">
                  Nivel de Membresía
                </label>
                <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10 pointer-events-none">
                  @if (tier()) {
                    <span class="material-symbols-outlined text-supporter animate-in zoom-in duration-300">check_circle</span>
                  }
                  @if (!tier() && showErrors()) {
                    <span class="material-symbols-outlined text-partner animate-in zoom-in duration-300">cancel</span>
                  }
                </div>
              </div>

              <app-input 
                [value]="email()" 
                (valueChange)="email.set($event)" 
                (blur)="onEmailBlur()"
                label="Email" 
                [showSuccess]="emailValid()"
                [showError]="(!emailValid() && showErrors())"
                placeholder="tu@email.com" 
              />
            </div>

            @if (emailValid() && hasCheckedEmail()) {
              <div class="pt-6 animate-in fade-in slide-in-from-top-4 duration-700">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <app-input 
                    [value]="userName()" 
                    (valueChange)="userName.set($event)" 
                    label="Nombre de Usuario (Login)" 
                    [showSuccess]="userValid()"
                    [showError]="(!userValid() && showErrors())"
                    placeholder="mminimo 3 letras" 
                  />

                  <app-input 
                    [value]="djName()" 
                    (valueChange)="djName.set($event)" 
                    (blur)="checkDjNameAvailability()"
                    label="Nombre de DJ" 
                    [showSuccess]="djNameStatus() === 'available'"
                    [showError]="(djNameStatus() !== 'available' && showErrors())"
                    placeholder="Nombre artístico" 
                  />
                  
                  <div class="relative group">
                    <span class="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/20 group-focus-within:text-primary transition-colors z-10" [class.text-partner]="!nationality() && showErrors()">public</span>
                    <select [ngModel]="nationality()" (ngModelChange)="nationality.set($event)" name="nationality" class="w-full h-[64px] bg-transparent border border-white/10 rounded-xl px-4 pl-14 text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none appearance-none cursor-pointer font-mono text-sm pt-4 peer" [class.border-partner]="!nationality() && showErrors()" [class.text-partner]="!nationality() && showErrors()">
                      <option value="" disabled selected class="bg-[#0a0a0a] text-white/60">Selecciona tu país</option>
                      @for (c of countries; track c.code) {
                        <option [value]="c.name" class="bg-[#0a0a0a]">{{ c.name }}</option>
                      }
                    </select>
                    <label class="absolute left-14 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none transition-all duration-200 peer-focus:top-3 peer-focus:text-[10px] peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-primary" [class.hidden]="nationality()" [class.text-partner]="!nationality() && showErrors()">
                      Nacionalidad / País
                    </label>
                    <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                      @if (nationalityValid()) {
                        <span class="material-symbols-outlined text-supporter animate-in zoom-in duration-300">check_circle</span>
                      }
                      @if (!nationality() && showErrors()) {
                        <span class="material-symbols-outlined text-partner animate-in zoom-in duration-300">cancel</span>
                      }
                    </div>
                  </div>

                  <div class="col-span-1 md:col-span-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                     <input 
                       #avatarInput 
                       type="file" 
                       class="hidden" 
                       accept="image/png, image/jpeg, image/webp" 
                       (change)="onAvatarSelected($event)"
                     />

                     @if (avatarPreview() || avatarUrl()) {
                        <!-- Compact View (Selected) -->
                        <div class="relative w-full p-3 border border-white/10 rounded-xl bg-white/5 flex items-center justify-between gap-4 animate-in fade-in duration-300 group hover:border-white/20 transition-all">
                           <div class="flex items-center gap-4">
                              <div class="relative cursor-pointer" (click)="removeAvatar()" title="Eliminar foto">
                                 <div class="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden">
                                    <img [src]="avatarPreview() || avatarUrl()" class="w-full h-full object-cover">
                                 </div>
                                 <div class="absolute -top-1 -right-1 w-5 h-5 bg-black/80 rounded-full flex items-center justify-center border border-white/20 hover:border-red-500 hover:bg-red-500/20 transition-colors">
                                    <span class="material-symbols-outlined text-[12px] text-white hover:text-red-500">close</span>
                                 </div>
                              </div>
                              <div (click)="avatarInput.click()" class="cursor-pointer">
                                 <p class="text-sm font-bold text-white group-hover:text-primary transition-colors">Foto de Perfil</p>
                                 <p class="text-[10px] text-white/50 monotech">JPG, PNG o WEBP (Optimizado)</p>
                              </div>
                           </div>
                           <span class="material-symbols-outlined text-supporter text-xl animate-in zoom-in duration-300">check_circle</span>
                        </div>
                     } @else {
                        <!-- Big Drop Zone (Empty) -->
                        <div 
                           class="relative w-full p-4 border border-dashed border-white/20 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group flex items-center gap-4"
                           (click)="avatarInput.click()"
                           (dragover)="onAvatarDragOver($event)"
                           (dragleave)="onAvatarDragLeave($event)"
                           (drop)="onAvatarDrop($event)"
                           [class.border-primary]="isAvatarDragging()"
                           [class.bg-primary-10]="isAvatarDragging()"
                        >
                           <div class="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center overflow-hidden bg-black/40 shrink-0 relative transition-transform group-hover:scale-105">
                              <span class="material-symbols-outlined text-2xl text-white/40 group-hover:text-primary transition-colors">add_a_photo</span>
                           </div>

                           <div class="flex-1">
                             <p class="text-sm font-bold text-white group-hover:text-primary transition-colors">
                                Seleccionar Foto de Perfil
                             </p>
                             <p class="text-xs text-white/50 monotech mt-1">
                                JPG, PNG o WEBP (Máx 2MB)
                             </p>
                           </div>

                           <div class="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-white group-hover:bg-primary group-hover:border-primary group-hover:text-black transition-all">
                             EXPLORAR
                           </div>
                        </div>
                     }
                     @if (avatarError()) {
                       <p class="text-[10px] text-red-500 mt-2 ml-1 animate-in slide-in-from-top-1 font-mono">⚠ {{ avatarError() }}</p>
                     }
                  </div>
                </div>
              </div>
            }
            
            @if (avatarPreview() || avatarUrl()) {
              <div class="glass p-6 rounded-2xl border border-white/10 bg-white/5 flex items-center gap-6 mt-3">
                <div class="w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden" [class]="avatarBorderClass()" [style.boxShadow]="avatarGlowShadow()">
                  <img [src]="avatarPreview() || avatarUrl()" class="w-full h-full object-cover" alt="Previsualización de avatar">
                </div>
                <div class="flex-1">
                  <p class="text-sm font-bold text-white">Así se verá en el Muro de la Fama</p>
                  <p class="text-xs text-white/50 monotech">Vista grande para confirmar el recorte circular.</p>
                </div>
              </div>
            }
            
            @if (croppingActive()) {
              <div class="glass p-6 rounded-2xl border border-white/10 bg-white/5 mt-3 space-y-4">
                <p class="text-xs monotech text-white/60 uppercase">Ajusta tu foto</p>
                <div 
                  class="mx-auto w-[300px] h-[300px] rounded-full border-2 border-white/20 overflow-hidden relative cursor-grab bg-black/40"
                  (mousedown)="onCropMouseDown($event)"
                  (mousemove)="onCropMouseMove($event)"
                  (mouseup)="onCropMouseUp()"
                  (mouseleave)="onCropMouseUp()"
                  (wheel)="onCropWheel($event)"
                >
                  <img 
                    [src]="avatarPreview() || avatarUrl()" 
                    alt="Crop preview" 
                    class="absolute top-0 left-0 select-none"
                    [style.transform]="'translate('+cropX()+'px,'+cropY()+'px) scale('+cropScale()+')'"
                    [style.transformOrigin]="'center center'"
                    draggable="false"
                  />
                </div>
                <div class="flex items-center gap-4">
                  <input type="range" min="0.8" max="3" step="0.01" [value]="cropScale()" (input)="updateScale($event)" class="w-full">
                  <span class="text-xs monotech text-white/40">Zoom</span>
                </div>
                <div class="flex items-center gap-3">
                  <app-button variant="primary" size="sm" (action)="applyCrop()">APLICAR RECORTE</app-button>
                  <app-button variant="outline" size="sm" (action)="croppingActive.set(false)">CANCELAR</app-button>
                </div>
              </div>
            }
            
            @if (djNameStatus() === 'checking') {
               <p class="text-[10px] monotech text-primary animate-pulse">Verificando disponibilidad de nombre...</p>
            } @else if (djNameStatus() === 'taken') {
               <p class="text-[10px] monotech text-partner">Este nombre de DJ ya está ocupado.</p>
            }
          </div>
        }

        <!-- Step 2: Selección de Meses -->
        @if (step() === 2) {
          <div class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div class="space-y-2">
              <h3 class="text-3xl font-black text-white uppercase tracking-tighter monotech">Vigencia</h3>
              <p class="text-white/40 text-sm monotech uppercase tracking-widest">Paso 02 — La transparencia</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div class="relative group">
                <span class="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/20 group-focus-within:text-primary transition-colors z-10">calendar_month</span>
                <select [ngModel]="monthsPaid()" (ngModelChange)="monthsPaid.set($event)" name="monthsPaid" class="w-full h-[64px] bg-transparent border border-white/10 rounded-xl px-4 pl-14 text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none appearance-none cursor-pointer font-mono text-sm pt-4 peer">
                  <option value="1" class="bg-[#0a0a0a]">1 mes</option>
                  <option value="2" class="bg-[#0a0a0a]">2 meses</option>
                  <option value="3" class="bg-[#0a0a0a]">3 meses (Recomendado)</option>
                  <option value="6" class="bg-[#0a0a0a]">6 meses</option>
                  <option value="12" class="bg-[#0a0a0a]">12 meses</option>
                </select>
                <label class="absolute left-14 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none transition-all duration-200 peer-focus:top-3 peer-focus:text-[10px] peer-focus:text-primary peer-valid:top-3 peer-valid:text-[10px] peer-valid:text-primary">
                  ¿Cuántos meses quieres abonar?
                </label>
              </div>
              

              <div class="glass p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                 <div class="flex justify-between items-end">
                    <span class="text-[10px] monotech text-white/40 uppercase tracking-widest">Monto Total</span>
                    <span class="text-2xl font-black text-primary">{{ tierAmount() }}</span>
                 </div>
                 <div class="flex justify-between items-center pt-4 border-t border-white/5">
                    <span class="text-[10px] monotech text-white/40 uppercase tracking-widest">Expira</span>
                    <span class="text-sm font-bold text-white/80">{{ estimateExpiryDateString(monthsPaid()) }}</span>
                 </div>
                 <p class="text-[11px] text-white/30 italic">
                    @if (monthsPaid() >= 3) {
                       "Asegura el mantenimiento del software por más tiempo y obtén prioridad en builds."
                    } @else {
                       "Puedes renovar mensualmente o adelantar meses en cualquier momento."
                    }
                 </p>
              </div>
            </div>

            <div class="glass p-6 rounded-2xl border bg-black/30 mt-4 motion-safe:animate-pulse" [class]="previewBorderClass()" [style.boxShadow]="previewGlowShadow()">
              <div class="flex items-center gap-3 mb-4">
                <span class="material-symbols-outlined text-2xl" [class]="previewIconClass()">{{ previewIconName() }}</span>
                <div>
                  <p class="text-white font-bold">{{ previewTitle() }}</p>
                  <p class="text-white/60 text-sm">{{ previewSubtitle() }}</p>
                </div>
              </div>
                @if (avatarPreview() || avatarUrl()) {
                  <div class="flex items-center gap-4 mb-4">
                    <div class="w-16 h-16 rounded-full overflow-hidden" [class]="avatarBorderClass()" [style.boxShadow]="avatarGlowShadow()">
                      <img [src]="avatarPreview() || avatarUrl()" alt="Avatar" class="w-full h-full object-cover">
                    </div>
                    <div class="text-xs monotech text-white/50">
                      Vista del avatar estandarizado (400x400) con estilo FlowMix
                    </div>
                  </div>
                }
              <div class="flex items-center gap-2">
                <span class="px-3 py-1 rounded-full text-sm font-bold" [class]="tierBadgeClass()">
                  {{ tierLabel() }}
                </span>
                <span class="text-[10px] monotech text-white/40 uppercase tracking-widest">Previsualización del Muro de la Fama</span>
              </div>
            </div>
          </div>
        }

        <!-- Step 3: Manual Payment (Alias) -->
        @if (step() === 3) {
          <div class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div class="space-y-2">
              <h3 class="text-3xl font-black text-white uppercase tracking-tighter monotech">Transferencia</h3>
              <p class="text-white/40 text-sm monotech uppercase tracking-widest">Paso 03 — El punto crítico</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Alias -->
              <div class="glass p-5 rounded-2xl border border-white/10 bg-white/5 relative group">
                <p class="text-[10px] monotech text-white/40 uppercase tracking-widest mb-3">CBU / Alias</p>
                <div class="text-sm font-bold mb-4 break-all">{{ supabase.getBankAlias() || 'Alias no configurado' }}</div>
                <app-button variant="outline" size="sm" [fullWidth]="true" (action)="copyText(supabase.getBankAlias() || '')">
                   <span class="flex items-center gap-2"><span class="material-symbols-outlined text-sm">content_copy</span> COPIAR</span>
                </app-button>
              </div>

              <!-- Monto -->
              <div class="glass p-5 rounded-2xl border border-white/10 bg-white/5 relative group">
                <p class="text-[10px] monotech text-white/40 uppercase tracking-widest mb-3">Monto Exacto</p>
                <div class="text-xl font-black text-primary mb-4">{{ tierAmount() }}</div>
                <app-button variant="outline" size="sm" [fullWidth]="true" (action)="copyText(totalAmountNumeric().toString())">
                   <span class="flex items-center gap-2"><span class="material-symbols-outlined text-sm">content_copy</span> COPIAR VALOR</span>
                </app-button>
              </div>

              <!-- Concepto -->
              <div class="glass p-5 rounded-2xl border border-white/10 bg-white/5 relative group">
                <p class="text-[10px] monotech text-white/40 uppercase tracking-widest mb-3">Concepto Sugerido</p>
                <div class="text-xl font-black text-secondary mb-4">{{ paymentCode() }}</div>
                <app-button variant="outline" size="sm" [fullWidth]="true" (action)="copyText(paymentCode())">
                   <span class="flex items-center gap-2"><span class="material-symbols-outlined text-sm">content_copy</span> COPIAR</span>
                </app-button>
              </div>
            </div>

            <div class="space-y-6">
               <div class="space-y-2">
                  <p class="text-xs monotech text-white/60 uppercase">Comprobante de Pago</p>
                  <!-- Drag & Drop Upload -->
                  <div
                    class="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden"
                    [class]="dropZoneClass()"
                    (dragover)="onDragOver($event)"
                    (dragleave)="onDragLeave($event)"
                    (drop)="onDrop($event)"
                    (click)="fileInput.click()"
                  >
                    <input type="file" accept="image/*,application/pdf" class="hidden" #fileInput (change)="onFileSelected($event)" />
                    
                    @if (uploadProgress() > 0 && uploadProgress() < 100) {
                       <div class="absolute inset-x-0 bottom-0 h-1 bg-white/5">
                          <div class="h-full bg-primary transition-all duration-300" [style.width.%]="uploadProgress()"></div>
                       </div>
                    }

                    <div class="flex flex-col items-center gap-2">
                       @if (receiptFile()) {
                          <span class="material-symbols-outlined text-4xl text-supporter">check_circle</span>
                          <div class="text-sm">
                            <span class="text-white/80 monotech">¡Cargado! — {{ receiptFile()?.name }}</span>
                          </div>
                       } @else if (uploadProgress() > 0 && uploadProgress() < 100) {
                          <span class="material-symbols-outlined text-4xl text-primary animate-spin">loading</span>
                          <div class="text-sm monotech text-primary">Subiendo... {{ uploadProgress() }}%</div>
                       } @else {
                          <span class="material-symbols-outlined text-4xl opacity-30">cloud_upload</span>
                          <div class="text-sm">
                            <span class="text-white/50 monotech">Arrastra aquí o haz click para subir el comprobante</span>
                          </div>
                       }
                    </div>
                  </div>
               </div>

               <app-input 
                  icon="receipt_long" 
                  [value]="transactionRef()" 
                  (valueChange)="transactionRef.set($event)" 
                  label="Referencia (Opcional)"
                  placeholder="Ej. Nº de operación o titular" 
               />
            </div>

            <div class="glass p-6 rounded-2xl border bg-black/30 mt-4 motion-safe:animate-pulse" [class]="previewBorderClass()" [style.boxShadow]="previewGlowShadow()">
              <div class="flex items-center gap-3 mb-4">
                <span class="material-symbols-outlined text-2xl motion-safe:animate-pulse" [class]="previewIconClass()">{{ previewIconName() }}</span>
                <div>
                  <p class="text-white font-bold">{{ previewTitle() }}</p>
                  <p class="text-white/60 text-sm">{{ previewSubtitle() }}</p>
                </div>
              </div>
              @if (avatarPreview() || avatarUrl()) {
                <div class="flex items-center gap-4 mb-4">
                  <div class="w-16 h-16 rounded-full overflow-hidden" [class]="avatarBorderClass()" [style.boxShadow]="avatarGlowShadow()">
                    <img [src]="avatarPreview() || avatarUrl()" alt="Avatar" class="w-full h-full object-cover">
                  </div>
                  <div class="text-xs monotech text-white/50">
                    Avatar estandarizado (400x400) con halo por nivel
                  </div>
                </div>
              }
              <div class="flex items-center gap-2">
                <span class="px-3 py-1 rounded-full text-sm font-bold" [class]="tierBadgeClass()">
                  {{ tierLabel() }}
                </span>
                <span class="text-[10px] monotech text-white/40 uppercase tracking-widest">Previsualización del Muro de la Fama</span>
              </div>
            </div>
          </div>
        }

        <!-- Step 4: Confirmation & Preview -->
        @if (step() === 4) {
          <div class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div class="space-y-2">
              <h3 class="text-3xl font-black text-white uppercase tracking-tighter monotech">Confirmación</h3>
              <p class="text-white/40 text-sm monotech uppercase tracking-widest">Paso 04 — Todo listo</p>
            </div>

            <!-- Summary Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Profile Summary -->
              <div class="glass p-5 rounded-2xl border border-white/10 bg-white/5 space-y-3">
                 <h4 class="text-xs monotech text-white/40 uppercase tracking-widest">Tus Datos</h4>
                 <div class="flex items-center gap-3">
                    @if (avatarPreview() || avatarUrl()) {
                       <div class="w-12 h-12 rounded-full overflow-hidden" [class]="avatarBorderClass()" [style.boxShadow]="avatarGlowShadow()">
                         <img [src]="avatarPreview() || avatarUrl()" class="w-full h-full object-cover" alt="Avatar">
                       </div>
                    } @else {
                       <div class="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                          <span class="material-symbols-outlined text-white/20">person</span>
                       </div>
                    }
                    <div class="overflow-hidden">
                       <div class="text-white font-bold truncate">{{ userName() }}</div>
                       <div class="text-xs text-white/60 truncate">{{ email() }}</div>
                       <div class="text-xs text-primary mt-1 truncate">{{ djName() }}</div>
                    </div>
                 </div>
              </div>

              <!-- Membership Summary -->
              <div class="glass p-5 rounded-2xl border border-white/10 bg-white/5 space-y-3">
                 <h4 class="text-xs monotech text-white/40 uppercase tracking-widest">Membresía</h4>
                 <div class="flex justify-between items-center">
                    <span class="text-white/60">Nivel</span>
                    <span class="px-2 py-0.5 rounded text-xs font-bold uppercase" [class]="tierBadgeClass()">{{ tierLabel() }}</span>
                 </div>
                 <div class="flex justify-between items-center">
                    <span class="text-white/60">Duración</span>
                    <span class="text-white font-mono">{{ monthsPaid() }} mes{{ monthsPaid() > 1 ? 'es' : '' }}</span>
                 </div>
                 <div class="flex justify-between items-center pt-2 border-t border-white/5">
                    <span class="text-white/60">Total</span>
                    <span class="text-xl font-black text-primary">{{ tierAmount() }}</span>
                 </div>
              </div>

              <!-- Payment Proof -->
              <div class="glass p-5 rounded-2xl border border-white/10 bg-white/5 space-y-3 md:col-span-2">
                 <h4 class="text-xs monotech text-white/40 uppercase tracking-widest">Comprobante</h4>
                 <div class="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5">
                    <span class="material-symbols-outlined text-supporter">receipt_long</span>
                    <div class="overflow-hidden">
                       <p class="text-sm text-white truncate">{{ receiptFile()?.name || 'Archivo subido previamente' }}</p>
                       <p class="text-[10px] text-white/40 monotech">Listo para procesar</p>
                    </div>
                 </div>
              </div>
            </div>
            
            <div class="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-3">
               <span class="material-symbols-outlined text-primary mt-0.5">info</span>
               <div class="space-y-1">
                  <p class="text-sm text-white font-bold">Importante</p>
                  <p class="text-xs text-white/70 leading-relaxed">
                     Al hacer clic en "Finalizar", tus datos serán procesados y tu membresía entrará en estado de verificación.
                     Te notificaremos por email cuando esté activa.
                  </p>
               </div>
            </div>
          </div>
        }

        <!-- Navigation -->
        <div class="flex items-center gap-3 pt-2">
          @if (step() > 1) {
            <app-button variant="outline" size="md" (action)="prevStep()">Atrás</app-button>
          }
          <app-button
            [type]="step() === 4 ? 'submit' : 'button'"
            [disabled]="isLoading() || !isCurrentStepValid()"
            [variant]="buttonVariant()"
            size="lg"
            (action)="step() === 4 ? onSubmit() : nextStep()"
          >
            {{ step() === 4 ? (isLoading() ? 'Procesando…' : 'Finalizar') : 'Continuar' }}
          </app-button>
        </div>
      </form>
      }

      <!-- Loading Overlay -->
      @if (isLoading()) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div class="glass p-8 rounded-2xl border border-white/10 max-w-md w-full mx-4">
            <h3 class="text-xl font-bold text-white mb-6 monotech">Procesando tu membresía...</h3>
            
            <!-- Progress Steps -->
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-xl" [class]="savingProfile() ? 'text-primary animate-pulse' : uploadProgress() > 0 ? 'text-primary' : 'text-white/40'">
                  {{ savingProfile() || uploadProgress() > 0 ? 'check_circle' : 'radio_button_unchecked' }}
                </span>
                <span class="text-white/80 text-sm">Guardando perfil</span>
              </div>
              
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-xl" [class]="uploadProgress() === 100 ? 'text-primary' : uploadProgress() > 0 ? 'text-primary animate-pulse' : 'text-white/40'">
                  {{ uploadProgress() === 100 ? 'check_circle' : uploadProgress() > 0 ? 'schedule' : 'radio_button_unchecked' }}
                </span>
                <span class="text-white/80 text-sm">Subiendo comprobante</span>
              </div>
              
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-xl" [class]="savingMembership() ? 'text-primary animate-pulse' : queuingEmail() ? 'text-primary' : 'text-white/40'">
                  {{ savingMembership() || queuingEmail() ? 'check_circle' : 'radio_button_unchecked' }}
                </span>
                <span class="text-white/80 text-sm">Creando membresía</span>
              </div>
              
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-xl" [class]="queuingEmail() ? 'text-primary animate-pulse' : 'text-white/40'">
                  {{ queuingEmail() ? 'check_circle' : 'radio_button_unchecked' }}
                </span>
                <span class="text-white/80 text-sm">Programando notificaciones</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Success Screen -->
      @if (success()) {
        <div class="mt-6 space-y-6">
          <!-- Header -->
          <div class="glass p-6 rounded-xl border border-white/10 bg-black/30">
            <div class="flex items-center gap-3 mb-4">
              <span class="material-symbols-outlined text-3xl text-primary">check_circle</span>
              <div>
                <h3 class="text-2xl font-bold text-white">¡Pago Registrado! 🎧</h3>
                <p class="text-white/70">Tu solicitud está en proceso de verificación</p>
              </div>
            </div>
            
            <!-- Transaction ID -->
            <div class="glass p-4 rounded-lg border border-white/10 bg-white/5">
              <p class="text-[10px] monotech text-white/60 uppercase tracking-widest font-bold mb-1">
                ID de Seguimiento
              </p>
              <p class="text-lg font-mono text-white">{{ transactionRef() }}</p>
            </div>
          </div>

          <!-- Membership Summary -->
          <div class="glass p-6 rounded-xl border border-white/10 bg-black/30">
            <h4 class="text-lg font-bold text-white mb-4">Resumen de Membresía</h4>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-[10px] monotech text-white/60 uppercase tracking-widest font-bold mb-1">
                  Nivel
                </p>
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-full text-sm font-bold" [class]="tierBadgeClass()">
                    {{ tierLabel() }}
                  </span>
                </div>
              </div>
              
              <div>
                <p class="text-[10px] monotech text-white/60 uppercase tracking-widest font-bold mb-1">
                  Meses Pagados
                </p>
                <p class="text-white font-bold">{{ monthsPaid() }} {{ monthsPaid() === 1 ? 'mes' : 'meses' }}</p>
              </div>
              
              <div>
                <p class="text-[10px] monotech text-white/60 uppercase tracking-widest font-bold mb-1">
                  Vigencia Hasta
                </p>
                <p class="text-white font-mono">{{ expiryDateFormatted() }}</p>
              </div>
              <div>
                <p class="text-[10px] monotech text-white/60 uppercase tracking-widest font-bold mb-1">
                  Monto Total
                </p>
                <p class="text-white font-bold">{{ tierAmount() }}</p>
              </div>
            </div>
          </div>

          <!-- Verification Timeline -->
          <div class="glass p-6 rounded-xl border border-white/10 bg-black/30">
            <h4 class="text-lg font-bold text-white mb-4">Estado de Verificación</h4>
            
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-primary">check_circle</span>
                <div class="flex-1">
                  <p class="text-white font-medium">Transferencia registrada</p>
                  <p class="text-white/60 text-sm">{{ currentDateFormatted() }}</p>
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-yellow-500">schedule</span>
                <div class="flex-1">
                  <p class="text-white font-medium">Verificación en proceso</p>
                  <p class="text-white/60 text-sm">Cotejando comprobante con banco</p>
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-white/40">pending</span>
                <div class="flex-1">
                  <p class="text-white/60 font-medium">Activación</p>
                  <p class="text-white/40 text-sm">Pendiente de confirmación</p>
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-white/40">mail</span>
                <div class="flex-1">
                  <p class="text-white/60 font-medium">Email de acceso</p>
                  <p class="text-white/40 text-sm">Se enviará al activar</p>
                </div>
              </div>
            </div>
          </div>


          <!-- Renewal Notice -->
          <div class="glass p-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-yellow-500 mt-1">info</span>
              <div class="text-sm text-white/80">
                <p class="font-bold text-white mb-2">Sobre la Renovación</p>
                <p>Tu membresía se renueva mensualmente. Te notificaremos por email cuando esté próxima a vencer.</p>
                <p class="mt-2">Si deseas adelantar meses adicionales, simplemente realiza otra transferencia y sube el comprobante. Extenderemos tu vigencia automáticamente.</p>
              </div>
            </div>
          </div>

          <!-- CTAs -->
          <div class="flex gap-3">
            <app-button variant="outline" size="md" (action)="goDocs()">
              Explorar Documentación
            </app-button>
            <app-button variant="primary" size="md" (action)="goTrack()">
              Seguir Estado
            </app-button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [],
})
export class MembershipFormComponent implements OnInit {
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  readonly supabase = inject(SupabaseService);
  private readonly route = inject(ActivatedRoute);

  // Step/state
  step = signal(1);
  isLoading = signal(false);
  success = signal(false);
  showErrors = signal(false);
  progress = computed(() => (this.step() / 4) * 100);

  // Data - Step 1
  tier = signal<Tier | ''>('');
  email = signal('');
  userName = signal('');
  djName = signal('');
  nationality = signal('');
  os = signal('');
  osVersion = signal('');
  architecture = signal('');
  countries = COUNTRIES;
  profilesHasFullNameColumn = signal<boolean | null>(null);

  // Data - Step 2
  monthsPaid = signal(1);

  // Data - Step 3
  transactionRef = signal('');
  receiptFile = signal<File | null>(null);
  isDragging = signal(false);

  // Loading states
  savingProfile = signal(false);
  uploadProgress = signal(0);
  savingMembership = signal(false);
  queuingEmail = signal(false);
  autoFilled = signal(false);
  hasCheckedEmail = signal(false);
  private checkedEmails = new Set<string>();
  
  // Avatar
  avatarFile = signal<File | null>(null);
  avatarPreview = signal<string | null>(null);
  croppingActive = signal<boolean>(false);
  cropScale = signal<number>(1);
  cropX = signal<number>(0);
  cropY = signal<number>(0);
  cropDragging = signal<boolean>(false);
  private cropLastX = 0;
  private cropLastY = 0;
  avatarUrl = signal<string | null>(null);
  avatarError = signal<string | null>(null);
  isAvatarDragging = signal(false);

  // Validation UI signals
  djNameStatus = signal<'checking' | 'available' | 'taken' | 'none'>('none');
  emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((this.email() || '').trim()));
  userValid = computed(() => (this.userName() || '').trim().length >= 3);
  nationalityValid = computed(() => (this.nationality() || '').trim().length > 2);
  
  // Payment specifics
  paymentCode = signal('');

  // UI helpers
  progressBarClass(): string {
    switch (this.tier() || 'apoyo') {
      case 'apoyo': return 'bg-[#22c55e]';
      case 'interno': return 'bg-[#3b82f6]';
      case 'socio': return 'bg-[#ef4444]';
      default: return 'bg-primary';
    }
  }
  buttonVariant(): 'primary' | 'supporter' | 'insider' | 'partner' {
    switch (this.tier()) {
      case 'apoyo': return 'supporter';
      case 'interno': return 'insider';
      case 'socio': return 'partner';
      default: return 'primary';
    }
  }
  successIconClass(): string {
    switch (this.tier()) {
      case 'apoyo': return 'text-[#22c55e]';
      case 'interno': return 'text-[#3b82f6]';
      case 'socio': return 'text-[#ef4444]';
      default: return 'text-primary';
    }
  }
  monthlyAmount(): number {
    switch (this.tier() || 'apoyo') {
      case 'apoyo': return 5000;
      case 'interno': return 12000;
      case 'socio': return 25000;
      default: return 0;
    }
  }
  totalAmountNumeric(): number {
    return this.monthlyAmount() * (this.monthsPaid() || 1);
  }
  tierAmount(): string {
    const total = this.totalAmountNumeric();
    try {
      return total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
    } catch {
      return `ARS ${total.toString()}`;
    }
  }
  previewBorderClass(): string {
    switch (this.tier() || 'apoyo') {
      case 'socio':
        return 'border-red-500/60 shadow-[0_0_12px_#ef4444]';
      case 'interno':
        return 'border-blue-500/60 shadow-[0_0_12px_#3b82f6]';
      case 'apoyo':
      default:
        return 'border-green-400/60 shadow-[0_0_12px_#22c55e]';
    }
  }
  previewIconName(): string {
    switch (this.tier() || 'apoyo') {
      case 'socio': return 'rocket_launch';
      case 'interno': return 'stacked_line_chart';
      case 'apoyo': default: return 'volunteer_activism';
    }
  }
  previewIconClass(): string {
    switch (this.tier() || 'apoyo') {
      case 'socio': return 'text-red-400';
      case 'interno': return 'text-blue-400';
      case 'apoyo': default: return 'text-green-400';
    }
  }
  avatarGlowShadow(): string {
    switch (this.tier() || 'apoyo') {
      case 'socio':
        return '0 0 18px #ef4444, 0 0 28px #ef4444';
      case 'interno':
        return '0 0 18px #3b82f6, 0 0 28px #3b82f6';
      case 'apoyo':
      default:
        return '0 0 18px #22c55e, 0 0 28px #22c55e';
    }
  }
  avatarBorderClass(): string {
    switch (this.tier() || 'apoyo') {
      case 'socio':
        return 'border border-red-500/50';
      case 'interno':
        return 'border border-blue-500/50';
      case 'apoyo':
      default:
        return 'border border-green-400/50';
    }
  }
  previewTitle(): string {
    switch (this.tier() || 'apoyo') {
      case 'socio': return 'Donante Fundador';
      case 'interno': return 'Especialista en Feedback';
      case 'apoyo': default: return 'Colaborador';
    }
  }
  previewSubtitle(): string {
    switch (this.tier() || 'apoyo') {
      case 'socio': return 'Borde rojo neón, ícono de cohete.';
      case 'interno': return 'Borde azul neón, ícono de gráfico.';
      case 'apoyo': default: return 'Borde verde/blanco, ícono de mano con corazón.';
    }
  }
  previewGlowShadow(): string {
    switch (this.tier() || 'apoyo') {
      case 'socio':
        return '0 0 12px #ef4444, 0 0 24px #ef4444';
      case 'interno':
        return '0 0 12px #3b82f6, 0 0 24px #3b82f6';
      case 'apoyo':
      default:
        return '0 0 12px #22c55e, 0 0 24px #22c55e';
    }
  }
  tierDescription(): string {
    const base =
      this.tier() === 'apoyo' ? 'Reconocimiento comunitario y aporte al desarrollo abierto.' :
        this.tier() === 'interno' ? 'Acceso temprano a builds y funciones experimentales.' :
          this.tier() === 'socio' ? 'Influencia directa y prioridad en feedback.' : '';
    const total = this.monthlyAmount() * (this.monthsPaid() || 1);
    let totalLabel = `ARS ${total}`;
    try {
      totalLabel = total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
    } catch { void 0; }
    const expiry = this.estimateExpiryDateString(this.monthsPaid() || 1);
    return `${base} Total por ${this.monthsPaid() || 1} meses: ${totalLabel}. Vigencia estimada hasta: ${expiry}.`;
  }
  async copyText(text: string): Promise<void> {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      // Optional: you could add a "copied" flag here for visual feedback
    } catch {
      alert('Error al copiar al portapapeles');
    }
  }
  async copyAlias(): Promise<void> {
    await this.copyText(this.supabase.getBankAlias() || '');
  }
  estimateExpiryDateString(months: number): string {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    const day = `${d.getDate()}`.padStart(2, '0');
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  tierLabel(): string {
    const t = this.tier();
    if (t === 'apoyo') return 'Apoyo';
    if (t === 'interno') return 'Interno';
    if (t === 'socio') return 'Socio';
    return '';
  }

  // New helper methods for success screen
  expiryDateFormatted(): string {
    const months = this.monthsPaid() || 1;
    return this.estimateExpiryDateString(months);
  }

  currentDateFormatted(): string {
    const now = new Date();
    const day = `${now.getDate()}`.padStart(2, '0');
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const year = now.getFullYear();
    const hours = `${now.getHours()}`.padStart(2, '0');
    const minutes = `${now.getMinutes()}`.padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  }

  tierBadgeClass(): string {
    switch (this.tier()) {
      case 'apoyo': return 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30';
      case 'interno': return 'bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30';
      case 'socio': return 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30';
      default: return 'bg-white/10 text-white border border-white/20';
    }
  }

  async checkDjNameAvailability(): Promise<void> {
    const name = this.djName();
    if (!name || name.length < 2) {
      this.djNameStatus.set('none');
      return;
    }
    // Permitir nombres duplicados (múltiples DJs pueden llamarse igual)
    this.djNameStatus.set('available');
  }

  generatePaymentCode(): string {
    const random = Math.floor(Math.random() * 900) + 100;
    return `DJ-${random}`;
  }

  async checkExistingUser(email: string): Promise<void> {
    if (!email || this.checkedEmails.has(email)) return;
    this.autoFilled.set(false); // Reset status for new check
    this.checkedEmails.add(email);
    
    // Safety check: if we already have data filled by the user, maybe we shouldn't overwrite?
    // User requested "Auto-completa el formulario", so we overwrite if found.
    
    console.log('🔍 Checking waitlist for:', email);
    const profile = await this.supabase.getProfileByEmail(email);
    
    if (profile) {
      console.log('✨ [Membership] Profile found for ' + email + ':', profile);
      untracked(() => {
        // Only set values if THEY ARE NOT EMPTY in the profile
        if (profile.username && profile.username.trim()) {
           console.log('  -> Auto-filling username:', profile.username);
           this.userName.set(profile.username);
        }
        
        // Aggressive Sanity Check for djName
        const rawDjName = profile.djName?.trim() || '';
        
        // Define what we consider "trash" data (technical descriptions or placeholders)
        const isTechnicalTrash = /^(paso\s*\d|step\s*\d|ux[:\s]|ui[:\s]|\d+\.\s*paso)/i.test(rawDjName);
        const isTooLong = rawDjName.length > 40;
        const reflectsInstructions = rawDjName.toLowerCase().includes('identificación') || rawDjName.toLowerCase().includes('valida');

        if (rawDjName && !isTechnicalTrash && !isTooLong && !reflectsInstructions) {
          console.log('  -> ✅ Auto-filling djName:', rawDjName);
          this.djName.set(rawDjName);
          this.checkDjNameAvailability();
        } else if (rawDjName) {
           console.warn('  -> 🛑 DJ Name filtered out (trash detected):', rawDjName);
           // If we find trash in the DB, we definitely DON'T fill it.
        }
        
        if (profile.nationality && profile.nationality.trim()) {
          console.log('  -> Auto-filling nationality:', profile.nationality);
          this.nationality.set(profile.nationality);
        }
        
        this.autoFilled.set(true);
        this.saveDraft();
      });
    } else {
      console.log('ℹ️ [Membership] No profile found for email:', email);
    }
    this.hasCheckedEmail.set(true);
  }

  onEmailBlur(): void {
    if (this.emailValid()) {
      this.checkExistingUser(this.email());
    }
  }

  saveDraft(): void {
    const draft = {
      tier: this.tier(),
      email: this.email(),
      userName: this.userName(),
      djName: this.djName(),
      nationality: this.nationality(),
      avatarUrl: this.avatarUrl(),
      monthsPaid: this.monthsPaid(),
      step: this.step()
    };
    localStorage.setItem('membership_draft', JSON.stringify(draft));
  }

  loadDraft(): void {
    const raw = localStorage.getItem('membership_draft');
    if (!raw) return;
    
    try {
      const draft = JSON.parse(raw);
      if (draft.tier) this.tier.set(draft.tier);
      if (draft.email) {
        this.email.set(draft.email);
        this.checkedEmails.add(draft.email); // Don't trigger auto-fill again if loading draft
      }
      if (draft.userName) this.userName.set(draft.userName);
      if (draft.djName) this.djName.set(draft.djName);
      if (draft.nationality) this.nationality.set(draft.nationality);
      if (draft.avatarUrl) this.avatarUrl.set(draft.avatarUrl);
      if (draft.monthsPaid) this.monthsPaid.set(draft.monthsPaid);
      if (draft.step) this.step.set(draft.step);
      
      console.log('📦 Draft loaded from localStorage');
    } catch (e) {
      console.error('Error loading draft', e);
    }
  }

  resetDraft(): void {
    localStorage.removeItem('membership_draft');
    this.userName.set('');
    this.djName.set('');
    this.nationality.set('');
    this.avatarUrl.set(null);
    this.avatarPreview.set(null);
    this.avatarFile.set(null);
    this.autoFilled.set(false);
    this.checkedEmails.clear();
    console.log('🗑️ Draft cleared and signals reset');
  }

  constructor() {
    effect(() => {
      const email = this.email();
      const isValid = this.emailValid();
      
      if (isValid && !this.checkedEmails.has(email)) {
        untracked(() => this.checkExistingUser(email));
      }
      
      // Auto-save on any sensitive change
      untracked(() => this.saveDraft());
    });
    
    // Also watch other fields for auto-save
    effect(() => {
      this.userName();
      this.djName();
      this.nationality();
      this.monthsPaid();
      this.tier();
      this.step();
      untracked(() => this.saveDraft());
    });
  }

  ngOnInit(): void {
    // this.loadDraft(); // Deshabilitado para evitar cargar datos antiguos que confundan al usuario
    this.paymentCode.set(this.generatePaymentCode());
    this.route.queryParamMap.subscribe(params => {
      const tierParam = params.get('tier') as Tier;
      if (tierParam && ['apoyo', 'interno', 'socio'].includes(tierParam)) {
        this.tier.set(tierParam);
      }
    });
    this.supabase.checkProfilesFullNameColumn().then(v => this.profilesHasFullNameColumn.set(v));
  }

  calculateExpiryDate(startDate: Date, months: number): Date {
    const expiry = new Date(startDate);
    expiry.setMonth(expiry.getMonth() + months);
    return expiry;
  }

  // Avatar Handling
  onAvatarDragOver(ev: DragEvent): void {
    ev.preventDefault();
    this.isAvatarDragging.set(true);
  }
  onAvatarDragLeave(ev: DragEvent): void {
    ev.preventDefault();
    this.isAvatarDragging.set(false);
  }
  onAvatarDrop(ev: DragEvent): void {
    ev.preventDefault();
    this.isAvatarDragging.set(false);
    const file = ev.dataTransfer?.files?.[0] || null;
    if (file) this.handleAvatarSelected(file);
  }
  onAvatarSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null;
    if (file) this.handleAvatarSelected(file);
  }

  async handleAvatarSelected(file: File): Promise<void> {
    this.avatarError.set(null);
    
    // Validation
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      this.avatarError.set('Formato no válido. Solo JPG, PNG o WEBP.');
      return;
    }

    try {
      // Compress/Resize client-side
      const compressed = await this.compressImage(file);
      
      // Check size after compression
      if (compressed.size > 2 * 1024 * 1024) {
        this.avatarError.set('El archivo es demasiado pesado incluso optimizado.');
        return;
      }

      this.avatarFile.set(compressed);
      
      // Local Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview.set(e.target?.result as string);
        this.croppingActive.set(true);
      };
      reader.readAsDataURL(compressed);
    } catch (e) {
      console.error('Error handling avatar:', e);
      this.avatarError.set('Error al procesar la imagen.');
    }
  }

  removeAvatar(): void {
    this.avatarFile.set(null);
    this.avatarPreview.set(null);
    this.avatarUrl.set(null);
    this.avatarError.set(null);
    this.croppingActive.set(false);
    this.saveDraft();
  }

  async compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
             reject(new Error('No context'));
             return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              reject(new Error('Canvas conversion failed'));
            }
          }, 'image/jpeg', 0.85);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  async uploadAvatarIfNeeded(): Promise<boolean> {
    const file = this.avatarFile();
    if (!file) return true; // No new file to upload, proceed
    
    const email = this.email();
    if (!email) {
       this.avatarError.set('Ingresa un email válido primero.');
       return false;
    }

    this.isLoading.set(true);
    try {
      const extension = file.name.split('.').pop() || 'jpg';
      // Sanitize email for filename
      const safeEmail = email.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${safeEmail}_avatar_${Date.now()}.${extension}`;
      
      const res = await this.supabase.uploadAvatar(file, fileName);
      
      if (res.ok && res.url) {
        this.avatarUrl.set(res.url);
        this.avatarFile.set(null); // Clear file so we don't re-upload
        this.saveDraft(); // Save the URL in draft
        return true;
      } else {
        throw new Error(res.error || 'Error al subir imagen');
      }
    } catch (e: any) {
        console.error('Error uploading avatar:', e);
        let msg = e.message || 'Error al subir la imagen';
        if (String(msg).includes('Cliente no configurado')) {
          msg = 'Supabase no está configurado en este entorno. Configura la URL y el Anon Key en el Panel Admin.';
        }
        // Handle missing bucket error specifically
        if (msg.includes('Bucket not found')) {
          msg = 'El bucket "colaboradores_fotos" no existe en Supabase. Por favor créalo y asegúrate que sea Público.';
        }
        this.avatarError.set(msg);
        return false;
      } finally {
      this.isLoading.set(false);
    }
  }

  onCropMouseDown(ev: MouseEvent): void {
    this.cropDragging.set(true);
    this.cropLastX = ev.clientX;
    this.cropLastY = ev.clientY;
  }
  onCropMouseMove(ev: MouseEvent): void {
    if (!this.cropDragging()) return;
    const dx = ev.clientX - this.cropLastX;
    const dy = ev.clientY - this.cropLastY;
    this.cropX.update(x => x + dx);
    this.cropY.update(y => y + dy);
    this.cropLastX = ev.clientX;
    this.cropLastY = ev.clientY;
  }
  onCropMouseUp(): void {
    this.cropDragging.set(false);
  }
  onCropWheel(ev: WheelEvent): void {
    ev.preventDefault();
    const delta = ev.deltaY > 0 ? -0.05 : 0.05;
    this.cropScale.update(s => Math.min(3, Math.max(0.8, s + delta)));
  }
  updateScale(ev: Event): void {
    const v = parseFloat((ev.target as HTMLInputElement).value);
    if (!isNaN(v)) this.cropScale.set(Math.min(3, Math.max(0.8, v)));
  }
  applyCrop(): void {
    const src = this.avatarPreview();
    if (!src) { this.croppingActive.set(false); return; }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.save();
      ctx.beginPath();
      ctx.arc(200, 200, 200, 0, Math.PI * 2);
      ctx.clip();
      ctx.filter = 'contrast(1.05) saturate(1.1)';
      const scale = this.cropScale();
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const dx = 200 - (drawW / 2) + this.cropX();
      const dy = 200 - (drawH / 2) + this.cropY();
      ctx.drawImage(img, dx, dy, drawW, drawH);
      ctx.restore();
      canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], `avatar_${Date.now()}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
        this.avatarFile.set(file);
        this.avatarPreview.set(canvas.toDataURL('image/jpeg'));
        this.croppingActive.set(false);
      }, 'image/jpeg', 0.9);
    };
    img.src = src;
  }

  // Drag & Drop (Receipt)
  onDragOver(ev: DragEvent): void {
    ev.preventDefault();
    this.isDragging.set(true);
  }
  onDragLeave(ev: DragEvent): void {
    ev.preventDefault();
    this.isDragging.set(false);
  }
  dropZoneClass(): string {
    const base = 'border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/10';
    const active = this.isDragging() ? 'border-primary bg-primary/10' : '';
    const success = this.receiptFile() ? 'border-supporter/50 bg-supporter/5' : '';
    
    if (this.showErrors() && !this.receiptFile()) {
      return 'border-partner bg-partner/5 animate-pulse';
    }

    return `${base} ${active} ${success}`;
  }
  onDrop(ev: DragEvent): void {
    ev.preventDefault();
    this.isDragging.set(false);
    const file = ev.dataTransfer?.files?.[0] || null;
    if (file) this.handleFileSelected(file);
  }
  onFileSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null;
    if (file) this.handleFileSelected(file);
  }

  async handleFileSelected(file: File): Promise<void> {
    console.log('📎 Archivo detectado:', file.name);
    this.receiptFile.set(file);
    
    // Immediate upload as requested
    this.uploadProgress.set(10); // Start progress
    try {
      const safeName = (this.email() || 'anon').replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileExtension = file.name.split('.').pop() || 'png';
      const finalFileName = `${safeName}_${Date.now()}.${fileExtension}`;
      
      this.uploadProgress.set(30);
      const up = await this.supabase.uploadPaymentReceipt(file, finalFileName);
      
      if (!up.ok) throw new Error(up.error || 'Error al subir comprobante');
      
      this.uploadProgress.set(100);
      console.log('✅ Comprobante subido (URL temporal guardada):', up.url);
      localStorage.setItem('temp_receipt_url', up.url || '');
    } catch (err: any) {
      console.error('❌ Error en subida inmediata:', err);
      alert(err.message || 'Error al subir el archivo');
      this.receiptFile.set(null);
      this.uploadProgress.set(0);
    }
  }

  // Navigation
  async nextStep(): Promise<void> {
    if (this.isCurrentStepValid()) {
      this.showErrors.set(false);
      if (this.step() === 1) {
        const uploaded = await this.uploadAvatarIfNeeded();
        if (!uploaded) return;
      }
      this.step.update(s => Math.min(4, s + 1));
    } else {
      this.showErrors.set(true);
    }
  }

  prevStep(): void {
    this.step.update(s => Math.max(1, s - 1));
  }
  isCurrentStepValid(): boolean {
    if (this.step() === 1) return this.isStep1Valid();
    if (this.step() === 2) return this.isStep2Valid();
    if (this.step() === 3) return this.isStep3Valid();
    if (this.step() === 4) return true;
    return false;
  }
  isStep1Valid(): boolean {
    return !!this.tier() && this.emailValid() && this.userValid() && this.nationalityValid();
  }
  isStep2Valid(): boolean {
    const m = this.monthsPaid();
    return !!m && m > 0;
  }
  isStep3Valid(): boolean {
    const rFile = this.receiptFile();
    const valid = !!rFile;
    console.log('Validando Paso 3:', {
      file: rFile?.name,
      hasFile: !!rFile,
      isValid: valid
    });
    return valid;
  }

  // Submit
  async onSubmit(): Promise<void> {
    const isVal = this.isCurrentStepValid();
    if (!isVal) return;

    this.isLoading.set(true);
    try {
      // 1) Profile upsert
      this.savingProfile.set(true);
      const emailVal = this.email();
      const userNameVal = this.userName() || (emailVal ? emailVal.split('@')[0] : 'user');
      const tierVal = this.tier() || 'apoyo';
      const monthsVal = this.monthsPaid() || 1;

      const profileData: Profile = {
        id: 'temp',
        username: userNameVal,
        djName: this.djName() || userNameVal,
        email: emailVal,
        nationality: this.nationality() || '',
        fotoUrl: this.avatarUrl() || undefined
      };

      const profRes = await this.supabase.upsertProfileCompat(profileData);
      if (!profRes.ok) throw new Error(profRes.error || 'Error guardando perfil');
      
      const prof = await this.supabase.getProfileByEmail(emailVal);
      if (!prof?.id) throw new Error('No se pudo obtener el perfil');
      this.savingProfile.set(false);

      // 2) Use already uploaded receipt
      const receiptUrl = localStorage.getItem('temp_receipt_url') || undefined;

      // 3) Membership insert with pending_verification
      this.savingMembership.set(true);
      const notesBase = (tierVal === 'socio') ? 'PRIORIDAD: SOCIO' : (tierVal === 'interno') ? 'FAST_TRACK: BUILDS' : 'COMMUNITY_RECOGNITION';
      const notes = `${notesBase}; MONTHS_PREPAID: ${monthsVal}; CONCEPT: ${this.paymentCode()}`;

      const startDate = new Date();
      const expiryDate = this.calculateExpiryDate(startDate, monthsVal);
      const finalRef = (this.transactionRef() || '').trim() || this.paymentCode();

      const membershipData: Membership = {
        userId: prof.id,
        level: tierVal,
        status: 'pending_verification',
        startDate,
        receiptUrl,
        transactionRef: finalRef,
        internalNotes: notes,
        monthsPaid: monthsVal,
        expiryDate
      };

      const memRes = await this.supabase.upsertMembershipCompat(membershipData);
      if (!memRes.ok) throw new Error(memRes.error || 'Error guardando membresía');
      
      this.savingMembership.set(false);
      localStorage.removeItem('temp_receipt_url');
      localStorage.removeItem('membership_draft');

      // 4) Emails
      this.queuingEmail.set(true);
      const job = await this.supabase.enqueueBenefitsEmail(emailVal, tierVal, monthsVal);
      const pending = await this.supabase.enqueuePendingPaymentNotification(emailVal, tierVal, finalRef, monthsVal);
      this.queuingEmail.set(false);

      this.success.set(true);
    } catch (e: any) {
      console.error('Error al procesar membresía:', e);
      alert(e.message || String(e) || 'Error desconocido');
    } finally {
      this.isLoading.set(false);
      this.savingProfile.set(false);
      this.uploadProgress.set(0);
      this.savingMembership.set(false);
      this.queuingEmail.set(false);
    }
  }

  // CTA actions
  goDocs(): void {
    window.open('https://flowmix.docs.example', '_blank');
  }
  goTrack(): void {
    const finalRef = (this.transactionRef() || '').trim() || this.paymentCode();
    this.router.navigate(['/track', finalRef]);
  }
}

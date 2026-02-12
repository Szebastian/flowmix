import { Injectable } from '@angular/core';

type Tier = 'partner' | 'insider' | 'supporter';

@Injectable({ providedIn: 'root' })
export class ShareImageService {
  private tierStyle(tier: Tier) {
    const map = {
      partner: { 
        border: '#ffb300', 
        glow: 'rgba(255, 179, 0, 0.6)', 
        accent: '#ffb300', 
        label: 'SOCIO · NIVEL 01',
        blur: 50,
        lineWidth: 4
      },
      insider: { 
        border: '#3b82f6', 
        glow: 'rgba(59, 130, 246, 0.4)', 
        accent: '#3b82f6', 
        label: 'INTERNO · NIVEL 02',
        blur: 25,
        lineWidth: 2
      },
      supporter: { 
        border: '#22c55e', 
        glow: 'rgba(34, 197, 94, 0.4)', 
        accent: '#22c55e', 
        label: 'COLABORADOR · NIVEL 03',
        blur: 25,
        lineWidth: 2
      },
    };
    return map[tier] || map.supporter;
  }

  private async loadImage(url: string): Promise<HTMLImageElement | null> {
    if (!url) return null;
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  private safeRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    const hasNative = (ctx as any).roundRect && typeof (ctx as any).roundRect === 'function';
    if (hasNative) {
      (ctx as any).roundRect(x, y, w, h, rr);
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.arcTo(x + w, y, x + w, y + rr, rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
    ctx.lineTo(x + rr, y + h);
    ctx.arcTo(x, y + h, x, y + h - rr, rr);
    ctx.lineTo(x, y + rr);
    ctx.arcTo(x, y, x + rr, y, rr);
    ctx.closePath();
  }

  private drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = '#0b0b0e';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  private async drawQr(ctx: CanvasRenderingContext2D, url: string, x: number, y: number, size: number) {
    try {
      const QRCodeModule = await import('qrcode');
      // Fix for CommonJS/ESM interop
      const qrAny = QRCodeModule as any;
      const qrFn = qrAny.toDataURL || qrAny.default?.toDataURL || qrAny.default;
      
      const dataUrl = await qrFn(url, {
        width: size,
        margin: 0,
        color: { dark: '#ffffff', light: '#00000000' },
      });
      const img = await this.loadImage(dataUrl);
      if (img) ctx.drawImage(img, x, y, size, size);
    } catch (e) {
      console.warn('QR generation failed', e);
      // QR opcional: si falla, continuamos sin bloquear la generación
    }
  }

  async generateOgImage(opts: { name: string; avatarUrl?: string; tier: Tier; profileUrl: string }): Promise<string> {
    const w = 1200;
    const h = 630;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    const style = this.tierStyle(opts.tier);

    this.drawGrid(ctx, w, h);

    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.strokeStyle = style.border;
    ctx.lineWidth = 6;
    const pad = 40;
    ctx.beginPath();
    this.safeRoundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, 30);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = style.glow;
    ctx.shadowBlur = style.blur;
    ctx.strokeStyle = style.border;
    ctx.lineWidth = style.lineWidth;
    ctx.beginPath();
    this.safeRoundRect(ctx, pad + 12, pad + 12, w - (pad + 12) * 2, h - (pad + 12) * 2, 26);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const avatarSize = 220;
    const avatarX = pad + 60;
    const avatarY = h / 2 - avatarSize / 2;
    if (opts.avatarUrl) {
      const img = await this.loadImage(opts.avatarUrl);
      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
      }
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(opts.name, avatarX + avatarSize + 40, avatarY + 8);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '600 28px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText(style.label, avatarX + avatarSize + 40, avatarY + 92);

    ctx.fillStyle = style.accent;
    ctx.font = '700 20px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText('MURO DE LA FAMA · FLOWMIX', avatarX + avatarSize + 40, avatarY + 140);

    await this.drawQr(ctx, opts.profileUrl, w - pad - 140, h - pad - 140, 120);

    try {
      return canvas.toDataURL('image/png');
    } catch {
      return this.generateOgImageNoAvatar({ name: opts.name, tier: opts.tier, profileUrl: opts.profileUrl });
    }
  }

  private async generateOgImageNoAvatar(opts: { name: string; tier: Tier; profileUrl: string }): Promise<string> {
    const w = 1200;
    const h = 630;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    const style = this.tierStyle(opts.tier);
    this.drawGrid(ctx, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.strokeStyle = style.border;
    ctx.lineWidth = 6;
    const pad = 40;
    ctx.beginPath();
    this.safeRoundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, 30);
    ctx.fill();
    ctx.stroke();
    ctx.shadowColor = style.glow;
    ctx.shadowBlur = style.blur;
    ctx.strokeStyle = style.border;
    ctx.lineWidth = style.lineWidth;
    ctx.beginPath();
    this.safeRoundRect(ctx, pad + 12, pad + 12, w - (pad + 12) * 2, h - (pad + 12) * 2, 26);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(opts.name, pad + 60, pad + 60);
    ctx.fillStyle = style.accent;
    ctx.font = '700 20px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText('MURO DE LA FAMA · FLOWMIX', pad + 60, pad + 140);
    await this.drawQr(ctx, opts.profileUrl, w - pad - 140, h - pad - 140, 120);
    return canvas.toDataURL('image/png');
  }

  async generateStoryImage(opts: { name: string; avatarUrl?: string; tier: Tier; profileUrl: string }): Promise<string> {
    const w = 1080;
    const h = 1920;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    const style = this.tierStyle(opts.tier);

    this.drawGrid(ctx, w, h);

    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.strokeStyle = style.border;
    ctx.lineWidth = 8;
    const pad = 48;
    ctx.beginPath();
    this.safeRoundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, 40);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = style.glow;
    ctx.shadowBlur = style.blur + 10; // Extra glow for stories
    ctx.strokeStyle = style.border;
    ctx.lineWidth = style.lineWidth + 1;
    ctx.beginPath();
    this.safeRoundRect(ctx, pad + 16, pad + 16, w - (pad + 16) * 2, h - (pad + 16) * 2, 36);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const avatarSize = 420;
    const avatarX = w / 2 - avatarSize / 2;
    const avatarY = 320;
    if (opts.avatarUrl) {
      const img = await this.loadImage(opts.avatarUrl);
      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
      }
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 96px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(opts.name, w / 2, avatarY + avatarSize + 60);

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '600 40px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText(style.label, w / 2, avatarY + avatarSize + 140);

    ctx.fillStyle = style.accent;
    ctx.font = '700 30px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText('MURO DE LA FAMA · FLOWMIX', w / 2, avatarY + avatarSize + 200);

    await this.drawQr(ctx, opts.profileUrl, w / 2 - 110, h - pad - 220, 220);

    try {
      return canvas.toDataURL('image/png');
    } catch {
      return this.generateStoryImageNoAvatar({ name: opts.name, tier: opts.tier, profileUrl: opts.profileUrl });
    }
  }

  private async generateStoryImageNoAvatar(opts: { name: string; tier: Tier; profileUrl: string }): Promise<string> {
    const w = 1080;
    const h = 1920;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    const style = this.tierStyle(opts.tier);
    this.drawGrid(ctx, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.strokeStyle = style.border;
    ctx.lineWidth = 8;
    const pad = 48;
    ctx.beginPath();
    this.safeRoundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, 40);
    ctx.fill();
    ctx.stroke();
    ctx.shadowColor = style.glow;
    ctx.shadowBlur = style.blur + 10;
    ctx.strokeStyle = style.border;
    ctx.lineWidth = style.lineWidth + 1;
    ctx.beginPath();
    this.safeRoundRect(ctx, pad + 16, pad + 16, w - (pad + 16) * 2, h - (pad + 16) * 2, 36);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 96px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(opts.name, w / 2, 820);
    ctx.fillStyle = style.accent;
    ctx.font = '700 30px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText('MURO DE LA FAMA · FLOWMIX', w / 2, 900);
    await this.drawQr(ctx, opts.profileUrl, w / 2 - 110, h - pad - 220, 220);
    return canvas.toDataURL('image/png');
  }
  download(dataUrl: string, fileName: string) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  private async toFile(dataUrl: string, fileName: string): Promise<File> {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type || 'image/png', lastModified: Date.now() });
  }

  async shareWeb(dataUrl: string, fileName: string, title: string, text: string, url?: string): Promise<boolean> {
    const files = [await this.toFile(dataUrl, fileName)];
    const n = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
      share?: (data: ShareData) => Promise<void>;
    };
    const can = n.canShare ? n.canShare({ files }) : false;
    if (can && n.share) {
      try {
        await n.share({ title, text, url, files });
        return true;
      } catch {
        return false;
      }
    }
    this.download(dataUrl, fileName);
    return false;
  }
}

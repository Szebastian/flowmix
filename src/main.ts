import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

const adminGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const tokenOk = localStorage.getItem('admin_token') === 'flowmix-admin';
  const user = (localStorage.getItem('admin_user') || '').trim().toLowerCase();
  const allowedRaw = (localStorage.getItem('admin_allowed_users') || '').toLowerCase();
  const allowed = allowedRaw.split(',').map(s => s.trim()).filter(Boolean);
  const userOk = !!user && allowed.includes(user);
  if (tokenOk && userOk) {
    return true;
  }
  return router.parseUrl('/admin/login');
};

const routes = [
  { 
    path: 'admin/login', 
    loadComponent: () => import('./app/admin/admin-login.component').then(m => m.AdminLoginComponent) 
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./app/admin/admin.container').then(m => m.AdminContainerComponent), 
    canActivate: [adminGuard] 
  },
  { 
    path: 'confirm', 
    loadComponent: () => import('./app/auth/confirm.component').then(m => m.ConfirmComponent) 
  },
  { 
    path: 'feedback', 
    loadComponent: () => import('./app/features/feedback/feedback.container').then(m => m.FeedbackContainerComponent) 
  },
  { 
    path: 'nosotros', 
    loadComponent: () => import('./app/features/about/about.container').then(m => m.AboutContainerComponent) 
  },
  { 
    path: 'membresias', 
    loadComponent: () => import('./app/features/memberships/memberships.container').then(m => m.MembershipsContainerComponent) 
  },
  { 
    path: 'track/:id', 
    loadComponent: () => import('./app/features/memberships/track/payment-status.component').then(m => m.PaymentStatusComponent) 
  },
];

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), provideHttpClient()],
}).catch((err) => console.error(err));

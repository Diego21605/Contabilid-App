import { Routes } from '@angular/router';
import { authGuard } from './guards/auth';

/**
 * Configuración de enrutamiento para Contabilid-App.
 * Define la ruta raíz protegida por un AuthGuard que carga MainLayout y sus subrutas hijas.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    title: 'Iniciar Sesión - Contabilid-App',
    loadComponent: () => import('./components/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    title: 'Registro de Usuario - Contabilid-App',
    loadComponent: () => import('./components/register/register').then(m => m.Register)
  },
  {
    path: '',
    loadComponent: () => import('./components/main-layout/main-layout').then(m => m.MainLayout),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard - Contabilid-App',
        loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'cuentas',
        title: 'Cuentas - Contabilid-App',
        loadComponent: () => import('./components/cuentas/cuentas').then(m => m.Cuentas)
      },
      {
        path: 'consultas',
        title: 'Consultas - Contabilid-App',
        loadComponent: () => import('./components/consultas/consultas').then(m => m.Consultas)
      },
      {
        path: 'usuario',
        title: 'Usuario - Contabilid-App',
        loadComponent: () => import('./components/usuario/usuario').then(m => m.Usuario)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

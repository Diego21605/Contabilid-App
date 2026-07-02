import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen bg-[#0f172a] text-slate-100 overflow-x-hidden font-sans">
      <!-- Sidebar para pantallas grandes -->
      <aside class="hidden md:flex flex-col w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 shrink-0">
        <!-- Logo / Marca -->
        <div class="p-6 border-b border-slate-800 flex items-center gap-3">
          <div class="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg class="w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span class="font-bold text-base text-white tracking-tight">Contabilid-App</span>
            <div class="text-[10px] font-mono text-slate-400 tracking-wider">V2.0 STABLE</div>
          </div>
        </div>

        <!-- Enlaces de navegación -->
        <nav class="flex-1 p-4 flex flex-col gap-1.5">
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-semibold"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-transparent"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
            <span class="text-sm">Dashboard</span>
          </a>

          <a
            routerLink="/cuentas"
            routerLinkActive="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-semibold"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-transparent"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span class="text-sm">Cuentas</span>
          </a>

          <a
            routerLink="/consultas"
            routerLinkActive="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-semibold"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-transparent"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span class="text-sm">Consultas</span>
          </a>

          <a
            routerLink="/usuario"
            routerLinkActive="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-semibold"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-transparent"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="text-sm">Usuario</span>
          </a>
        </nav>

        <!-- Información Corta del Usuario Autenticado -->
        <div class="p-4 border-t border-slate-800 flex items-center gap-3 bg-slate-950/40">
          <div class="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center font-bold text-white text-sm border border-slate-700 uppercase">
            {{ userInitial() }}
          </div>
          <div class="overflow-hidden">
            <div class="text-xs font-semibold text-white truncate">{{ userEmail() }}</div>
            <div class="text-[10px] text-slate-400">Sesión Activa</div>
          </div>
        </div>
      </aside>

      <!-- Contenedor Derecho Principal -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Barra de navegación móvil -->
        <header class="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 z-30">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md">
              <svg class="w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="font-bold text-sm text-white">Contabilid-App</span>
          </div>

          <!-- Botón de Menú Móvil -->
          <button
            (click)="toggleMenu()"
            class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              @if (isMenuOpen()) {
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </header>

        <!-- Desplegable Móvil -->
        @if (isMenuOpen()) {
          <div class="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex flex-col gap-1.5 animate-fadeIn z-20">
            <a
              routerLink="/dashboard"
              routerLinkActive="bg-emerald-500/10 text-emerald-400 font-semibold"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="isMenuOpen.set(false)"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              <span class="text-sm">Dashboard</span>
            </a>

            <a
              routerLink="/cuentas"
              routerLinkActive="bg-emerald-500/10 text-emerald-400 font-semibold"
              (click)="isMenuOpen.set(false)"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span class="text-sm">Cuentas</span>
            </a>

            <a
              routerLink="/consultas"
              routerLinkActive="bg-emerald-500/10 text-emerald-400 font-semibold"
              (click)="isMenuOpen.set(false)"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span class="text-sm">Consultas</span>
            </a>

            <a
              routerLink="/usuario"
              routerLinkActive="bg-emerald-500/10 text-emerald-400 font-semibold"
              (click)="isMenuOpen.set(false)"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="text-sm">Usuario</span>
            </a>
          </div>
        }

        <!-- Sección de Contenido Dinámico -->
        <main class="flex-1 overflow-y-auto p-4 md:p-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayout {
  private authService = inject(AuthService);
  
  isMenuOpen = signal(false);

  userEmail = () => this.authService.currentUser()?.email || 'usuario@ejemplo.com';
  userInitial = () => {
    const email = this.userEmail();
    return email.charAt(0).toUpperCase();
  };

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }
}

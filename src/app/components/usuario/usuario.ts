import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FinanceService, Cuenta, Movimiento } from '../../services/finance';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuario',
  imports: [CommonModule],
  template: `
    <div class="w-full max-w-4xl mx-auto font-sans relative pb-12">
      <!-- Background Glows -->
      <div class="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-[10%] left-[-10%] w-[45%] h-[45%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Header Section -->
      <div class="mb-8 border-b border-slate-800/60 pb-6 relative z-10">
        <h2 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Mi Perfil de Usuario
        </h2>
        <p class="text-xs text-slate-400 mt-1">Consulta tus estadísticas financieras, información de cuenta registrada y administra tu sesión activa.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <!-- Tarjeta de Perfil Principal -->
        <div class="md:col-span-2 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <!-- Avatar animado con gradiente -->
            <div class="flex items-center gap-4 mb-6">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 p-[3px] shadow-lg shadow-emerald-500/15">
                <div class="w-full h-full bg-slate-950 rounded-[13px] flex items-center justify-center font-extrabold text-white text-xl uppercase">
                  {{ userInitial() }}
                </div>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white tracking-tight">{{ userEmail() }}</h3>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Estatus: Conectado vía Firebase
                </span>
              </div>
            </div>

            <!-- Detalles de Cuenta -->
            <div class="space-y-4 pt-4 border-t border-slate-800/60">
              <div class="flex justify-between text-xs">
                <span class="text-slate-400">ID de Usuario:</span>
                <span class="text-slate-300 font-mono text-[11px] truncate max-w-[200px]">{{ userId() }}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-400">Correo de Acceso:</span>
                <span class="text-slate-300 font-semibold">{{ userEmail() }}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-400">Verificado:</span>
                <span class="text-slate-300 flex items-center gap-1 font-semibold">
                  <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sí (Firebase Auth)
                </span>
              </div>
            </div>
          </div>

          <!-- Botón de Cerrar Sesión Rojo Llamativo -->
          <div class="pt-8 mt-6 border-t border-slate-800/40">
            <button
              (click)="logout()"
              class="w-full py-3.5 px-5 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] transition-all text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-rose-500/10"
            >
              <svg class="w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión Activa
            </button>
          </div>
        </div>

        <!-- Tarjeta de Estadísticas Rápidas -->
        <div class="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div class="space-y-6">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Tu Actividad Financiera
            </h4>

            <!-- Cuentas registradas -->
            <div>
              <span class="text-xs text-slate-400">Cuentas Registradas</span>
              <div class="text-3xl font-extrabold text-white mt-1 font-mono">
                {{ totalCuentas() }}
              </div>
            </div>

            <!-- Movimientos totales -->
            <div>
              <span class="text-xs text-slate-400">Transacciones Históricas</span>
              <div class="text-3xl font-extrabold text-white mt-1 font-mono">
                {{ totalMovimientos() }}
              </div>
            </div>

            <!-- Balance total -->
            <div>
              <span class="text-xs text-slate-400">Patrimonio Neto</span>
              <div class="text-xl font-bold text-emerald-400 mt-1 font-mono">
                $ {{ patrimonioNeto().toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </div>
            </div>
          </div>

          <div class="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl mt-6">
            <p class="text-[10px] text-indigo-300 leading-relaxed text-center">
              Para reestablecer o alterar tus credenciales de acceso, por favor hazlo desde el panel de administración central de Firebase.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Usuario {
  private authService = inject(AuthService);
  private financeService = inject(FinanceService);
  private router = inject(Router);

  // Datos del usuario
  userEmail = () => this.authService.currentUser()?.email || 'usuario@ejemplo.com';
  userId = () => this.authService.currentUser()?.uid || 'N/A';
  userInitial = () => this.userEmail().charAt(0).toUpperCase();

  // Traer info financiera de Firestore
  cuentas = toSignal(this.financeService.getCuentas(), { initialValue: [] as Cuenta[] });
  movimientos = toSignal(this.financeService.getMovimientos(), { initialValue: [] as Movimiento[] });

  // Computes reactivos
  totalCuentas = computed(() => this.cuentas().length);
  totalMovimientos = computed(() => this.movimientos().length);
  
  patrimonioNeto = computed(() => {
    return this.cuentas().reduce((sum, c) => {
      // Activos suman balance, pasivos (deuda) restan balance
      if (c.tipo === 'credito') {
        return sum + (c.saldo || 0);
      } else {
        return sum - (c.saldo || 0);
      }
    }, 0);
  });

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (err) {
      console.error('Error cerrando sesión:', err);
    }
  }
}

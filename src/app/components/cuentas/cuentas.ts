import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FinanceService, Cuenta, Movimiento } from '../../services/finance';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cuentas',
  imports: [CommonModule],
  template: `
    <div class="w-full max-w-6xl mx-auto font-sans relative pb-12">
      <!-- Background Ambient Glows -->
      <div class="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800/60 pb-6 relative z-10">
        <div>
          <h2 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Mis Cuentas y Saldos
          </h2>
          <p class="text-xs text-slate-400 mt-1">Administra tus activos financieros, tarjetas de crédito, pasivos y consulta resúmenes mensuales.</p>
        </div>

        <button
          (click)="openAddAccountModal()"
          class="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold text-sm rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-98"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Cuenta
        </button>
      </div>

      <!-- Grid de Cuentas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        @for (cuenta of cuentas(); track cuenta.id) {
          @let summary = getAccountSummary(cuenta.id);
          <div 
            class="flex flex-col bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl transition-all hover:border-slate-700 hover:shadow-2xl relative overflow-hidden group"
          >
            <!-- Indicator Line of type -->
            <div 
              [class]="cuenta.tipo === 'credito' ? 'absolute top-0 left-0 right-0 h-1 bg-emerald-500' : 'absolute top-0 left-0 right-0 h-1 bg-rose-500'"
            ></div>

            <div class="flex items-start justify-between mb-4">
              <div>
                <span 
                  [class]="cuenta.tipo === 'credito' ? 'text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-emerald-400' : 'text-[10px] font-semibold uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full text-rose-400'"
                >
                  {{ cuenta.tipo === 'credito' ? 'Activo / Débito' : 'Pasivo / Tarjeta' }}
                </span>
                <h3 class="text-lg font-bold text-white mt-2 tracking-tight group-hover:text-emerald-300 transition-colors">
                  {{ cuenta.nombre }}
                </h3>
              </div>

              <!-- Delete Account Button -->
              <button
                (click)="eliminarCuenta(cuenta)"
                title="Eliminar Cuenta"
                class="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <!-- Saldo actual -->
            <div class="my-3">
              <span class="text-xs text-slate-400">Saldo Actual</span>
              <div class="text-3xl font-extrabold text-white tracking-tight mt-1">
                $ {{ (cuenta.saldo || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </div>
            </div>

            <!-- Resumen Mensual (Ingresos y Egresos del mes para esta cuenta) -->
            <div class="mt-4 p-3.5 bg-slate-950/40 border border-slate-800/40 rounded-xl space-y-2">
              <div class="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1 flex justify-between items-center">
                <span>Resumen del Mes</span>
                <span class="text-emerald-400 font-normal">Julio 2026</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-400">Ingresos:</span>
                <span class="text-emerald-400 font-semibold font-mono">+$ {{ summary.ingresos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-400">Gastos:</span>
                <span class="text-rose-400 font-semibold font-mono">-$ {{ summary.egresos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
              </div>
            </div>

            <!-- Quick Action Buttons -->
            <div class="grid grid-cols-2 gap-2 mt-5">
              <button
                (click)="openQuickActionModal(cuenta, 'ingreso')"
                class="py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wide transition-all hover:border-emerald-500/40"
              >
                Agregar Dinero
              </button>
              <button
                (click)="openQuickActionModal(cuenta, 'egreso')"
                class="py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-xs font-semibold tracking-wide transition-all hover:border-rose-500/40"
              >
                Registrar Gasto
              </button>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-12 px-4 border border-dashed border-slate-800 rounded-3xl text-center bg-slate-900/20 backdrop-blur-sm">
            <svg class="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 class="text-base font-semibold text-white">No tienes cuentas registradas</h3>
            <p class="text-xs text-slate-400 max-w-sm mx-auto mt-1">Registra tu primera cuenta para empezar a registrar movimientos e ingresos financieros.</p>
          </div>
        }
      </div>

      <!-- MODAL NUEVA CUENTA -->
      @if (showAddModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div class="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 class="text-base font-bold text-white tracking-tight">Nueva Cuenta</h3>
              <button (click)="closeAddAccountModal()" class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-5 space-y-4">
              <!-- Nombre de la cuenta -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Nombre de la cuenta</label>
                <input 
                  type="text" 
                  #nombreCuenta
                  placeholder="ej. BCP Soles, Tarjeta Visa, Efectivo" 
                  class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <!-- Tipo de cuenta -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Tipo de cuenta</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    (click)="selectedType.set('credito')"
                    type="button"
                    [class]="selectedType() === 'credito' ? 'py-2.5 rounded-xl border border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold text-xs transition-all' : 'py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 text-xs transition-all'"
                  >
                    Activo (Débito/Efectivo)
                  </button>
                  <button
                    (click)="selectedType.set('deuda')"
                    type="button"
                    [class]="selectedType() === 'deuda' ? 'py-2.5 rounded-xl border border-rose-500 bg-rose-500/10 text-rose-400 font-semibold text-xs transition-all' : 'py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 text-xs transition-all'"
                  >
                    Pasivo (Tarjeta Crédito)
                  </button>
                </div>
              </div>

              <!-- Saldo inicial -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Saldo / Balance Inicial ($)</label>
                <input 
                  type="number" 
                  #saldoCuenta
                  placeholder="0.00" 
                  step="0.01"
                  class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div class="p-5 border-t border-slate-800 flex justify-end gap-2.5 bg-slate-950/20">
              <button
                (click)="closeAddAccountModal()"
                class="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 transition-all"
              >
                Cancelar
              </button>
              <button
                (click)="saveAccount(nombreCuenta.value, saldoCuenta.value)"
                class="px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-md active:scale-98"
              >
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL DE ACCIÓN RÁPIDA (AGREGAR DINERO / REGISTRAR GASTO) -->
      @if (quickActionModal()) {
        @let act = quickActionDetails();
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div class="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 class="text-base font-bold text-white tracking-tight">
                {{ act.tipo === 'ingreso' ? 'Agregar Dinero a' : 'Registrar Gasto de' }} {{ act.cuentaName }}
              </h3>
              <button (click)="closeQuickActionModal()" class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-5 space-y-4">
              <!-- Monto -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Monto ($)</label>
                <input 
                  type="number" 
                  #montoMov
                  placeholder="0.00" 
                  step="0.01"
                  class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-base text-white placeholder-slate-500 outline-none transition-all font-mono font-bold"
                />
              </div>

              <!-- Categoría -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Categoría</label>
                <select 
                  #catMov
                  class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-all"
                >
                  @for (cat of activeCategories(act.tipo); track cat.id) {
                    <option [value]="cat.nombre">{{ cat.nombre }}</option>
                  }
                </select>
              </div>

              <!-- Descripción -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Descripción / Detalle</label>
                <input 
                  type="text" 
                  #descMov
                  placeholder="ej. Compra semanal, Bono extra, Pago de servicios" 
                  class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <!-- Fecha -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Fecha</label>
                <input 
                  type="date" 
                  #fechaMov
                  [value]="todayStr"
                  class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div class="p-5 border-t border-slate-800 flex justify-end gap-2.5 bg-slate-950/20">
              <button
                (click)="closeQuickActionModal()"
                class="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 transition-all"
              >
                Cancelar
              </button>
              <button
                (click)="saveQuickAction(montoMov.value, catMov.value, descMov.value, fechaMov.value)"
                [class]="act.tipo === 'ingreso' ? 'px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-md' : 'px-4 py-2 bg-rose-500 text-slate-100 text-xs font-bold rounded-xl hover:bg-rose-400 transition-all shadow-md'"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Cuentas {
  private financeService = inject(FinanceService);

  // Cuentas y movimientos obtenidos directamente de Firestore como Señales
  cuentas = toSignal(this.financeService.getCuentas(), { initialValue: [] as Cuenta[] });
  movimientos = toSignal(this.financeService.getMovimientos(), { initialValue: [] as Movimiento[] });
  categorias = toSignal(this.financeService.getCategorias(), { initialValue: [] as any[] });

  showAddModal = signal(false);
  selectedType = signal<'credito' | 'deuda'>('credito');

  quickActionModal = signal(false);
  quickActionDetails = signal<{ cuentaId: string; cuentaName: string; tipo: 'ingreso' | 'egreso' }>({
    cuentaId: '',
    cuentaName: '',
    tipo: 'ingreso'
  });

  todayStr = new Date().toISOString().split('T')[0];

  // Filtra categorías por tipo de acción rápida
  activeCategories = (tipo: 'ingreso' | 'egreso') => {
    const cats = this.categorias();
    const mapType = tipo === 'ingreso' ? 'ingreso' : 'egreso';
    return cats.filter(c => c.tipo === mapType || c.tipo === 'ambos');
  };

  getAccountSummary(cuentaId?: string): { ingresos: number; egresos: number } {
    if (!cuentaId) return { ingresos: 0, egresos: 0 };
    
    // Filtramos movimientos del mes actual para esta cuenta
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    
    const movs = this.movimientos().filter(m => {
      if (m.cuentaOrigenId !== cuentaId) return false;
      const mDate = new Date(m.fecha);
      return mDate.getFullYear() === currentYear && (mDate.getMonth() + 1) === currentMonth;
    });

    const ingresos = movs.filter(m => m.tipo === 'ingreso').reduce((sum, m) => sum + m.monto, 0);
    const egresos = movs.filter(m => m.tipo === 'egreso').reduce((sum, m) => sum + m.monto, 0);

    return { ingresos, egresos };
  }

  openAddAccountModal() {
    this.selectedType.set('credito');
    this.showAddModal.set(true);
  }

  closeAddAccountModal() {
    this.showAddModal.set(false);
  }

  async saveAccount(nombre: string, saldoStr: string) {
    if (!nombre.trim()) {
      alert('Debe ingresar un nombre para la cuenta.');
      return;
    }
    const saldo = parseFloat(saldoStr) || 0;
    const tipo = this.selectedType();

    try {
      await this.financeService.crearCuenta({
        nombre: nombre.trim(),
        tipo,
        saldo
      });
      this.closeAddAccountModal();
    } catch (err) {
      console.error('Error al guardar cuenta:', err);
      alert('No se pudo crear la cuenta.');
    }
  }

  async eliminarCuenta(cuenta: Cuenta) {
    if (!cuenta.id) return;
    if (confirm(`¿Estás seguro de que deseas eliminar la cuenta "${cuenta.nombre}"? Esto no eliminará sus transacciones históricas pero ya no estará disponible para nuevas.`)) {
      try {
        await this.financeService.eliminarCuenta(cuenta.id);
      } catch (err) {
        console.error('Error al eliminar cuenta:', err);
        alert('No se pudo eliminar la cuenta.');
      }
    }
  }

  openQuickActionModal(cuenta: Cuenta, tipo: 'ingreso' | 'egreso') {
    if (!cuenta.id) return;
    this.quickActionDetails.set({
      cuentaId: cuenta.id,
      cuentaName: cuenta.nombre,
      tipo
    });
    this.quickActionModal.set(true);
  }

  closeQuickActionModal() {
    this.quickActionModal.set(false);
  }

  async saveQuickAction(montoStr: string, categoria: string, descripcion: string, fecha: string) {
    const monto = parseFloat(montoStr);
    if (!monto || monto <= 0) {
      alert('El monto debe ser un número positivo.');
      return;
    }
    if (!categoria) {
      alert('Debe seleccionar una categoría.');
      return;
    }

    const { cuentaId, tipo } = this.quickActionDetails();

    try {
      await this.financeService.registrarMovimiento({
        monto,
        tipo,
        categoria,
        descripcion: descripcion.trim() || (tipo === 'ingreso' ? 'Ingreso Rápido' : 'Gasto Rápido'),
        fecha: fecha || this.todayStr,
        cuentaOrigenId: cuentaId
      });
      this.closeQuickActionModal();
    } catch (err) {
      console.error('Error al registrar movimiento rápido:', err);
      alert('Error al registrar la transacción. Verifica tu saldo.');
    }
  }
}

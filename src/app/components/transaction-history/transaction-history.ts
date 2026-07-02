import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { FinanceService, Movimiento, Cuenta, Categoria } from '../../services/finance';

@Component({
  selector: 'app-transaction-history',
  imports: [ReactiveFormsModule],
  template: `
    <div class="w-full max-w-4xl mx-auto bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden font-sans">
      <!-- Background Ambient Glows -->
      <div class="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Header -->
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800/60 pb-6">
        <div>
          <h3 class="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Historial de Movimientos
          </h3>
          <p class="text-xs text-slate-400 mt-1">Consulta y filtra tus movimientos en tiempo real</p>
        </div>

        <!-- Quick Stats of Filtered Items -->
        <div class="flex gap-3 text-xs">
          <div class="bg-slate-950/80 border border-slate-800/80 rounded-2xl px-4 py-2 flex flex-col justify-center min-w-[100px]">
            <span class="text-[10px] text-slate-500 font-semibold uppercase">Ingresos</span>
            <span class="text-emerald-400 font-bold text-sm mt-0.5">$ {{ totalIngresosFiltrados().toLocaleString() }}</span>
          </div>
          <div class="bg-slate-950/80 border border-slate-800/80 rounded-2xl px-4 py-2 flex flex-col justify-center min-w-[100px]">
            <span class="text-[10px] text-slate-500 font-semibold uppercase">Egresos</span>
            <span class="text-rose-400 font-bold text-sm mt-0.5">$ {{ totalEgresosFiltrados().toLocaleString() }}</span>
          </div>
          <div class="bg-slate-950/80 border border-slate-800/80 rounded-2xl px-4 py-2 flex flex-col justify-center min-w-[100px]">
            <span class="text-[10px] text-slate-500 font-semibold uppercase">Resultados</span>
            <span class="text-slate-300 font-bold text-sm mt-0.5">{{ movimientosFiltrados().length }}</span>
          </div>
        </div>
      </div>

      <!-- Filters Form -->
      <form [formGroup]="filtersForm" class="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl">
        <!-- Search Input -->
        <div class="md:col-span-4 flex flex-col gap-1.5">
          <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider" for="search">Buscar descripción</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              id="search"
              type="text"
              formControlName="search"
              placeholder="Ej. Súper, Netflix, Nómina..."
              class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <!-- Start Date -->
        <div class="md:col-span-2.5 flex flex-col gap-1.5">
          <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider" for="fechaInicio">Desde</label>
          <input
            id="fechaInicio"
            type="date"
            formControlName="fechaInicio"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all [color-scheme:dark]"
          />
        </div>

        <!-- End Date -->
        <div class="md:col-span-2.5 flex flex-col gap-1.5">
          <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider" for="fechaFin">Hasta</label>
          <input
            id="fechaFin"
            type="date"
            formControlName="fechaFin"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all [color-scheme:dark]"
          />
        </div>

        <!-- Category Filter -->
        <div class="md:col-span-1.5 flex flex-col gap-1.5">
          <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider" for="catFilter">Categoría</label>
          <select
            id="catFilter"
            formControlName="categoria"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">Todas</option>
            <option value="Pago de Deuda">Pago de Deuda</option>
            @for (cat of categorias(); track cat.id) {
              <option [value]="cat.nombre">{{ cat.nombre }}</option>
            }
          </select>
        </div>

        <!-- Account Filter -->
        <div class="md:col-span-1.5 flex flex-col gap-1.5">
          <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider" for="accountFilter">Cuenta</label>
          <select
            id="accountFilter"
            formControlName="cuentaId"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">Todas</option>
            @for (cuenta of cuentas(); track cuenta.id) {
              <option [value]="cuenta.id">{{ cuenta.nombre }}</option>
            }
          </select>
        </div>
      </form>

      <!-- Clear Filters Button -->
      @if (isAnyFilterActive()) {
        <div class="relative z-10 flex justify-end mb-4">
          <button
            type="button"
            (click)="resetFilters()"
            class="flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold transition-all hover:underline cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
            </svg>
            Restablecer Filtros (Mes Actual)
          </button>
        </div>
      }

      <!-- Movements Table / Cards -->
      <div class="relative z-10 overflow-hidden border border-slate-800 rounded-2xl bg-slate-950/30">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-800 bg-slate-950/70 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                <th class="py-3.5 px-4">Fecha</th>
                <th class="py-3.5 px-4">Descripción</th>
                <th class="py-3.5 px-4">Categoría</th>
                <th class="py-3.5 px-4">Cuenta(s)</th>
                <th class="py-3.5 px-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/50 text-slate-300 text-xs">
              @for (mov of movimientosFiltrados(); track mov.id) {
                <tr class="hover:bg-slate-800/15 transition-all">
                  <!-- Fecha -->
                  <td class="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                    {{ formatDate(mov.fecha) }}
                  </td>
                  
                  <!-- Descripcion -->
                  <td class="py-3.5 px-4">
                    <div class="font-medium text-slate-200">{{ mov.descripcion || 'Sin descripción' }}</div>
                    @if (mov.tipo === 'pago_deuda') {
                      <span class="text-[10px] text-blue-400/80 font-medium">Abono a Deuda</span>
                    }
                  </td>

                  <!-- Categoria -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <span 
                      [class]="mov.tipo === 'ingreso' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                        : mov.tipo === 'egreso' 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/15'"
                      class="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                    >
                      {{ mov.categoria || 'Sin categoría' }}
                    </span>
                  </td>

                  <!-- Cuenta(s) -->
                  <td class="py-3.5 px-4">
                    <div class="flex flex-col gap-0.5 text-[11px]">
                      <div class="flex items-center gap-1">
                        <span class="text-slate-500">Origen:</span>
                        <span class="text-slate-300 font-medium">{{ getNombreCuenta(mov.cuentaOrigenId) }}</span>
                      </div>
                      @if (mov.tipo === 'pago_deuda' && mov.cuentaDestinoDeudaId) {
                        <div class="flex items-center gap-1 text-[10px] text-blue-400">
                          <span>Abono a:</span>
                          <span class="font-semibold">{{ getNombreCuenta(mov.cuentaDestinoDeudaId) }}</span>
                        </div>
                      }
                    </div>
                  </td>

                  <!-- Monto -->
                  <td class="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-sm">
                    <span [class]="mov.tipo === 'ingreso' ? 'text-emerald-400' : 'text-slate-200'">
                      {{ mov.tipo === 'ingreso' ? '+' : '-' }} $&nbsp;{{ mov.monto.toLocaleString() }}
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="py-10 text-center text-slate-500 text-xs">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <svg class="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p class="font-medium">No se encontraron movimientos</p>
                      <p class="text-[11px] text-slate-600">Intenta modificando los filtros del mes actual</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionHistory {
  private financeService = inject(FinanceService);

  // Cuentas y Categorías obtenidas de Firestore
  cuentas = toSignal(this.financeService.getCuentas(), { initialValue: [] });
  categorias = toSignal(this.financeService.getCategorias(), { initialValue: [] });

  // Listado completo de Movimientos
  movimientosAll = toSignal(this.financeService.getMovimientos(), { initialValue: [] });

  // Formulario Reactivo para Filtros
  filtersForm = new FormGroup({
    search: new FormControl('', { nonNullable: true }),
    fechaInicio: new FormControl(this.getFirstDayOfCurrentMonth(), { nonNullable: true }),
    fechaFin: new FormControl(this.getLastDayOfCurrentMonth(), { nonNullable: true }),
    categoria: new FormControl('', { nonNullable: true }),
    cuentaId: new FormControl('', { nonNullable: true })
  });

  // Signal reactivo de los filtros del formulario
  filters = toSignal(this.filtersForm.valueChanges, { 
    initialValue: this.filtersForm.getRawValue() 
  });

  // Movimientos filtrados de manera reactiva e híper-eficiente usando Signals computed
  movimientosFiltrados = computed(() => {
    const f = this.filters();
    const movs = this.movimientosAll();

    const querySearch = f.search.trim().toLowerCase();
    const start = f.fechaInicio;
    const end = f.fechaFin;
    const cat = f.categoria;
    const account = f.cuentaId;

    return movs.filter((m: Movimiento) => {
      // 1) Filtrar por buscador de texto en descripción
      if (querySearch && !m.descripcion.toLowerCase().includes(querySearch)) {
        return false;
      }

      // 2) Filtrar por rango de fechas (FechaInicio, FechaFin)
      if (start && m.fecha < start) {
        return false;
      }
      if (end && m.fecha > end) {
        return false;
      }

      // 3) Filtrar por Categoría
      if (cat && m.categoria !== cat) {
        return false;
      }

      // 4) Filtrar por Cuenta (origen o destino si es pago_deuda)
      if (account) {
        const matchesOrigen = m.cuentaOrigenId === account;
        const matchesDestino = m.cuentaDestinoDeudaId === account;
        if (!matchesOrigen && !matchesDestino) {
          return false;
        }
      }

      return true;
    });
  });

  // Cálculos consolidados en tiempo real del conjunto filtrado
  totalIngresosFiltrados = computed(() => {
    return this.movimientosFiltrados()
      .filter((m: Movimiento) => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.monto, 0);
  });

  totalEgresosFiltrados = computed(() => {
    return this.movimientosFiltrados()
      .filter((m: Movimiento) => m.tipo === 'egreso' || m.tipo === 'pago_deuda')
      .reduce((sum, m) => sum + m.monto, 0);
  });

  isAnyFilterActive = computed(() => {
    const f = this.filters();
    const defaultStart = this.getFirstDayOfCurrentMonth();
    const defaultEnd = this.getLastDayOfCurrentMonth();

    return !!(
      f.search || 
      f.categoria || 
      f.cuentaId || 
      f.fechaInicio !== defaultStart || 
      f.fechaFin !== defaultEnd
    );
  });

  getNombreCuenta(id?: string): string {
    if (!id) return '-';
    const c = this.cuentas().find((cuenta: Cuenta) => cuenta.id === id);
    return c ? c.nombre : 'Cuenta eliminada';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  }

  resetFilters(): void {
    this.filtersForm.reset({
      search: '',
      fechaInicio: this.getFirstDayOfCurrentMonth(),
      fechaFin: this.getLastDayOfCurrentMonth(),
      categoria: '',
      cuentaId: ''
    });
  }

  // Métodos auxiliares para acotar las fechas al mes actual por defecto
  private getFirstDayOfCurrentMonth(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  }

  private getLastDayOfCurrentMonth(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();
    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(lastDay).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  }
}

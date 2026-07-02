import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FinanceService, Movimiento, Cuenta, Categoria } from '../../services/finance';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consultas',
  imports: [CommonModule],
  template: `
    <div class="w-full max-w-6xl mx-auto font-sans relative pb-12">
      <!-- Background Glows -->
      <div class="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-[10%] right-[-10%] w-[35%] h-[35%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800/60 pb-6 relative z-10">
        <div>
          <h2 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Historial y Consultas
          </h2>
          <p class="text-xs text-slate-400 mt-1">Busca, filtra y analiza tus movimientos financieros aplicando rangos de fechas, categorías y cuentas específicas.</p>
        </div>
      </div>

      <!-- panel superior de filtros reactivos -->
      <div class="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 md:p-6 mb-8 shadow-xl relative z-10 space-y-5">
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
          <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros de Búsqueda Reactivos
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- Fecha Inicio -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fecha Desde</label>
            <input 
              type="date" 
              (change)="updateStartDate($event)"
              class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all font-mono"
            />
          </div>

          <!-- Fecha Fin -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fecha Hasta</label>
            <input 
              type="date" 
              (change)="updateEndDate($event)"
              class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all font-mono"
            />
          </div>

          <!-- Cuenta -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cuenta</label>
            <select 
              (change)="updateAccount($event)"
              class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all"
            >
              <option value="ALL">Todas las cuentas</option>
              @for (cuenta of cuentas(); track cuenta.id) {
                <option [value]="cuenta.id">{{ cuenta.nombre }}</option>
              }
            </select>
          </div>

          <!-- Categoría -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Categoría</label>
            <select 
              (change)="updateCategory($event)"
              class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all"
            >
              <option value="ALL">Todas las categorías</option>
              @for (cat of categorias(); track cat.id) {
                <option [value]="cat.nombre">{{ cat.nombre }}</option>
              }
            </select>
          </div>

          <!-- Tipo de Movimiento -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tipo de Movimiento</label>
            <select 
              (change)="updateType($event)"
              class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all"
            >
              <option value="ALL">Todos los tipos</option>
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
              <option value="pago_deuda">Pago a Deuda</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Resumen Financiero del Período Filtrado -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 relative z-10">
        <!-- Ingresos filtrados -->
        <div class="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ingresos Filtrados</div>
            <div class="text-xl font-bold text-emerald-400 mt-1 font-mono">
              +$ {{ summary().ingresos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </div>
          </div>
          <div class="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>

        <!-- Egresos filtrados -->
        <div class="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Egresos Filtrados</div>
            <div class="text-xl font-bold text-rose-400 mt-1 font-mono">
              -$ {{ summary().egresos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </div>
          </div>
          <div class="w-8 h-8 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
        </div>

        <!-- Balance Neto filtrado -->
        <div class="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balance Selección</div>
            <div 
              [class]="summary().balance >= 0 ? 'text-xl font-bold text-emerald-400 mt-1 font-mono' : 'text-xl font-bold text-rose-400 mt-1 font-mono'"
            >
              $ {{ summary().balance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </div>
          </div>
          <div 
            [class]="summary().balance >= 0 ? 'w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400' : 'w-8 h-8 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400'"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Tabla / Lista estilizada de Movimientos Filtrados -->
      <div class="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl relative z-10">
        <div class="px-5 py-4 border-b border-slate-800/60 bg-slate-950/20 flex items-center justify-between">
          <div class="text-xs font-bold text-slate-300">
            Transacciones Coincidentes ({{ filteredMovimientos().length }})
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-800/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/10">
                <th class="px-5 py-3">Fecha</th>
                <th class="px-5 py-3">Descripción</th>
                <th class="px-5 py-3">Cuenta</th>
                <th class="px-5 py-3">Categoría</th>
                <th class="px-5 py-3">Tipo</th>
                <th class="px-5 py-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/40">
              @for (mov of filteredMovimientos(); track mov.id) {
                <tr class="hover:bg-slate-800/20 transition-all text-xs">
                  <!-- Fecha -->
                  <td class="px-5 py-4 text-slate-300 font-mono whitespace-nowrap">
                    {{ formatDate(mov.fecha) }}
                  </td>

                  <!-- Descripción -->
                  <td class="px-5 py-4 font-semibold text-white whitespace-nowrap max-w-xs truncate">
                    {{ mov.descripcion || 'Sin descripción' }}
                  </td>

                  <!-- Cuenta Origen -->
                  <td class="px-5 py-4 text-slate-400 whitespace-nowrap">
                    <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/30">
                      <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      {{ getAccountName(mov.cuentaOrigenId) }}
                    </span>
                  </td>

                  <!-- Categoría -->
                  <td class="px-5 py-4 text-slate-400 whitespace-nowrap">
                    {{ mov.categoria }}
                  </td>

                  <!-- Tipo con Badges -->
                  <td class="px-5 py-4 whitespace-nowrap">
                    @if (mov.tipo === 'ingreso') {
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                        Ingreso
                      </span>
                    } @else if (mov.tipo === 'egreso') {
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wide">
                        Egreso
                      </span>
                    } @else {
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wide">
                        Deuda
                      </span>
                    }
                  </td>

                  <!-- Monto -->
                  <td class="px-5 py-4 text-right whitespace-nowrap font-bold font-mono">
                    @if (mov.tipo === 'ingreso') {
                      <span class="text-emerald-400">+$ {{ mov.monto.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                    } @else {
                      <span class="text-rose-400">-$ {{ mov.monto.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-5 py-12 text-center text-slate-500">
                    <svg class="w-10 h-10 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p class="text-xs">No se encontraron movimientos con los filtros seleccionados.</p>
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
export class Consultas {
  private financeService = inject(FinanceService);

  // Cuentas, categorías y movimientos totales de Firestore en tiempo real como señales
  cuentas = toSignal(this.financeService.getCuentas(), { initialValue: [] as Cuenta[] });
  categorias = toSignal(this.financeService.getCategorias(), { initialValue: [] as Categoria[] });
  movimientos = toSignal(this.financeService.getMovimientos(), { initialValue: [] as Movimiento[] });

  // Señales reactivas locales para los filtros
  startDate = signal<string>('');
  endDate = signal<string>('');
  selectedAccountId = signal<string>('ALL');
  selectedCategoryName = signal<string>('ALL');
  selectedType = signal<string>('ALL');

  // Movimientos filtrados calculados reactivamente por Signals
  filteredMovimientos = computed(() => {
    let result = [...this.movimientos()];

    const sDate = this.startDate();
    const eDate = this.endDate();
    const actId = this.selectedAccountId();
    const catName = this.selectedCategoryName();
    const type = this.selectedType();

    // Filtro por fecha inicio
    if (sDate) {
      result = result.filter(m => m.fecha >= sDate);
    }

    // Filtro por fecha fin
    if (eDate) {
      result = result.filter(m => m.fecha <= eDate);
    }

    // Filtro por cuenta
    if (actId !== 'ALL') {
      result = result.filter(m => m.cuentaOrigenId === actId || m.cuentaDestinoDeudaId === actId);
    }

    // Filtro por categoría
    if (catName !== 'ALL') {
      result = result.filter(m => m.categoria === catName);
    }

    // Filtro por tipo de movimiento
    if (type !== 'ALL') {
      result = result.filter(m => m.tipo === type);
    }

    return result;
  });

  // Resumen financiero dinámico del período filtrado
  summary = computed(() => {
    const movs = this.filteredMovimientos();
    
    const ingresos = movs
      .filter(m => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.monto, 0);

    const egresos = movs
      .filter(m => m.tipo === 'egreso' || m.tipo === 'pago_deuda')
      .reduce((sum, m) => sum + m.monto, 0);

    const balance = ingresos - egresos;

    return { ingresos, egresos, balance };
  });

  // Métodos de actualización para las inputs
  updateStartDate(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.startDate.set(val);
  }

  updateEndDate(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.endDate.set(val);
  }

  updateAccount(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedAccountId.set(val);
  }

  updateCategory(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedCategoryName.set(val);
  }

  updateType(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedType.set(val);
  }

  // Nombre de cuenta para lookup
  getAccountName(id?: string): string {
    if (!id) return 'General';
    const ac = this.cuentas().find(c => c.id === id);
    return ac ? ac.nombre : 'Cuenta no encontrada';
  }

  // Formateador de fecha simple
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }
}

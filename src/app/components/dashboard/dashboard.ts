import { ChangeDetectionStrategy, Component, inject, signal, computed, effect, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FinanceService, Movimiento, Cuenta } from '../../services/finance';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [BaseChartDirective],
  template: `
    <div class="w-full max-w-5xl mx-auto bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden font-sans">
      <!-- Background Ambient Glows -->
      <div class="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-[-20%] left-[-20%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Header -->
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800/60 pb-6">
        <div>
          <h3 class="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Dashboard de Contabilidad
          </h3>
          <p class="text-xs text-slate-400 mt-1">Análisis financiero y métricas de desempeño del mes en curso</p>
        </div>

        <!-- Current Period Badge -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-emerald-400 font-semibold flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Período: {{ mesActualNombre() }}
          </span>
        </div>
      </div>

      <!-- Resumen de Balance, Cuentas y Deudas -->
      <div class="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <!-- Balance General Card -->
        <div class="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div class="absolute right-4 top-4 text-emerald-500/5">
            <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span class="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">Balance General (Crédito / Activos)</span>
          <h4 class="text-2xl font-bold mt-2 tracking-tight text-white">$ {{ balanceGeneral().toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}</h4>
          <p class="text-[11px] text-slate-400 mt-2">Suma acumulada de todas tus cuentas monetarias de tipo activo.</p>
        </div>

        <!-- Deudas Pendientes Card -->
        <div class="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div class="absolute right-4 top-4 text-rose-500/5">
            <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <span class="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">Deudas Totales Pendientes</span>
          <h4 class="text-2xl font-bold mt-2 tracking-tight text-rose-400">$ {{ totalDeudas().toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}</h4>
          <p class="text-[11px] text-slate-400 mt-2">Monto pendiente acumulado en cuentas de tipo pasivo/deuda.</p>
        </div>

        <!-- Balance Neto Consolidado -->
        <div class="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div class="absolute right-4 top-4 text-indigo-500/5">
            <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span class="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">Patrimonio Neto Líquido</span>
          <h4 [class]="balanceNeto() >= 0 ? 'text-emerald-400' : 'text-rose-400'" class="text-2xl font-bold mt-2 tracking-tight">
            $ {{ balanceNeto().toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </h4>
          <p class="text-[11px] text-slate-400 mt-2">Diferencia neta (Crédito - Deudas). Mide tu salud financiera real.</p>
        </div>
      </div>

      <!-- Gráficos del Negocio -->
      <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Gráfico de Barras: Comparativa Ingresos vs Egresos del Mes -->
        <div class="bg-slate-950/60 border border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col justify-between min-h-[360px]">
          <div>
            <h4 class="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              Comparativa: Mensual (Ingresos vs Egresos)
            </h4>
            <p class="text-[10px] text-slate-500 mt-0.5">Suma total de abonos (ingresos) contra cargos (egresos y abonos a deuda)</p>
          </div>

          <div class="relative w-full h-[240px] flex items-center justify-center mt-4">
            <canvas baseChart
              [data]="barChartData()"
              [options]="barChartOptions"
              [type]="'bar'">
            </canvas>
          </div>
        </div>

        <!-- Gráfico de Dona: Distribución de egresos por Categoría -->
        <div class="bg-slate-950/60 border border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col justify-between min-h-[360px]">
          <div>
            <h4 class="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
              Distribución de Gastos por Categoría
            </h4>
            <p class="text-[10px] text-slate-500 mt-0.5">Concentración de egresos agrupados por categorías en el mes actual</p>
          </div>

          <div class="relative w-full h-[240px] flex items-center justify-center mt-4">
            @if (hasGastoMovimientos()) {
              <canvas baseChart
                [data]="doughnutChartData()"
                [options]="doughnutChartOptions"
                [type]="'doughnut'">
              </canvas>
            } @else {
              <div class="text-center text-slate-500 flex flex-col items-center gap-2">
                <svg class="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-xs font-semibold">No hay gastos en el mes actual</p>
                <p class="text-[10px] text-slate-600">Registra un egreso para visualizar el gráfico de dona</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private financeService = inject(FinanceService);

  // Traer cuentas, categorías y movimientos desde Firestore
  cuentas = toSignal(this.financeService.getCuentas(), { initialValue: [] });
  movimientosAll = toSignal(this.financeService.getMovimientos(), { initialValue: [] });

  // Nombre del mes actual en español
  mesActualNombre = computed(() => {
    const nombres = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return nombres[new Date().getMonth()] + ' ' + new Date().getFullYear();
  });

  // 1) Cálculos de resumen
  balanceGeneral = computed(() => {
    return this.cuentas()
      .filter((c: Cuenta) => c.tipo === 'credito')
      .reduce((sum, c) => sum + c.saldo, 0);
  });

  totalDeudas = computed(() => {
    return this.cuentas()
      .filter((c: Cuenta) => c.tipo === 'deuda')
      .reduce((sum, c) => sum + c.saldo, 0);
  });

  balanceNeto = computed(() => {
    return this.balanceGeneral() - this.totalDeudas();
  });

  // Movimientos acotados al mes actual
  movimientosMesActual = computed(() => {
    const movs = this.movimientosAll();
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-indexed

    return movs.filter((m: Movimiento) => {
      if (!m.fecha) return false;
      const parts = m.fecha.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        return year === currentYear && month === currentMonth;
      }
      return false;
    });
  });

  // Comparativa acumulada de ingresos vs egresos para el gráfico de barras
  totalIngresosMes = computed(() => {
    return this.movimientosMesActual()
      .filter((m: Movimiento) => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.monto, 0);
  });

  totalEgresosMes = computed(() => {
    // Los egresos tradicionales más los pagos realizados a deudas (que representan salida de fondos)
    return this.movimientosMesActual()
      .filter((m: Movimiento) => m.tipo === 'egreso' || m.tipo === 'pago_deuda')
      .reduce((sum, m) => sum + m.monto, 0);
  });

  hasGastoMovimientos = computed(() => {
    return this.movimientosMesActual().some((m: Movimiento) => m.tipo === 'egreso' || m.tipo === 'pago_deuda');
  });

  // Agrupamiento por categorías para el gráfico de dona
  gastosPorCategoria = computed(() => {
    const gastos = this.movimientosMesActual().filter((m: Movimiento) => m.tipo === 'egreso' || m.tipo === 'pago_deuda');
    const map: Record<string, number> = {};

    gastos.forEach((m: Movimiento) => {
      const cat = m.categoria || 'Sin categoría';
      map[cat] = (map[cat] || 0) + m.monto;
    });

    return map;
  });

  // Datos reactivos para el gráfico de barras (Ingresos vs Egresos)
  barChartData = computed<ChartData<'bar'>>(() => {
    const ingresos = this.totalIngresosMes();
    const egresos = this.totalEgresosMes();

    return {
      labels: ['Ingresos del Mes', 'Egresos del Mes'],
      datasets: [
        {
          data: [ingresos, egresos],
          backgroundColor: [
            'rgba(16, 185, 129, 0.25)', // emerald border translucent fill
            'rgba(244, 63, 94, 0.25)'   // rose border translucent fill
          ],
          borderColor: [
            '#10b981', // emerald
            '#f43f5e'  // rose
          ],
          borderWidth: 2,
          borderRadius: 12,
          barThickness: 36
        }
      ]
    };
  });

  // Datos reactivos para el gráfico de dona (Gastos por Categoría)
  doughnutChartData = computed<ChartData<'doughnut'>>(() => {
    const map = this.gastosPorCategoria();
    const labels = Object.keys(map);
    const data = Object.values(map);

    // Paleta de colores atractiva
    const colorPalette = [
      { fill: 'rgba(99, 102, 241, 0.2)', border: '#6366f1' },  // indigo
      { fill: 'rgba(236, 72, 153, 0.2)', border: '#ec4899' },  // pink
      { fill: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b' },  // amber
      { fill: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6' },  // blue
      { fill: 'rgba(139, 92, 246, 0.2)', border: '#8b5cf6' },  // violet
      { fill: 'rgba(20, 184, 166, 0.2)', border: '#20b8a6' },  // teal
      { fill: 'rgba(100, 116, 139, 0.2)', border: '#64748b' }  // slate
    ];

    const backgroundColors = labels.map((_, i) => colorPalette[i % colorPalette.length].fill);
    const borderColors = labels.map((_, i) => colorPalette[i % colorPalette.length].border);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1.5,
          hoverOffset: 8
        }
      ]
    };
  });

  // Opciones de configuración de los gráficos
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 11, family: 'Inter, sans-serif', weight: 'bold' },
        bodyFont: { size: 11, family: 'Inter, sans-serif' },
        borderColor: '#1e293b',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => ` Total: $ ${context.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 10, family: 'Inter, sans-serif', weight: 'normal' }
        }
      },
      y: {
        grid: { color: 'rgba(30, 41, 59, 0.5)' },
        ticks: {
          color: '#94a3b8',
          font: { size: 9, family: 'Inter, sans-serif' },
          callback: (value) => `$ ${value.toLocaleString()}`
        }
      }
    }
  };

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#cbd5e1',
          font: { size: 10, family: 'Inter, sans-serif', weight: 'normal' },
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 11, family: 'Inter, sans-serif', weight: 'bold' },
        bodyFont: { size: 11, family: 'Inter, sans-serif' },
        borderColor: '#1e293b',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => ` Total: $ ${context.parsed.toLocaleString()}`
        }
      }
    }
  };
}

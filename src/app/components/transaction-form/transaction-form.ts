import { ChangeDetectionStrategy, Component, inject, signal, computed, effect } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { FinanceService, Cuenta, Categoria } from '../../services/finance';

@Component({
  selector: 'app-transaction-form',
  imports: [ReactiveFormsModule],
  template: `
    <div class="w-full max-w-xl mx-auto bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden font-sans">
      <!-- Ambient Lights -->
      <div class="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Header -->
      <div class="relative z-10 mb-6">
        <h3 class="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Registrar Movimiento
        </h3>
        <p class="text-xs text-slate-400 mt-1">Registra ingresos, egresos y abonos a deudas de forma sincronizada</p>
      </div>

      <!-- Success & Error Alerts -->
      @if (successMessage()) {
        <div class="mb-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-400 flex items-start gap-3 animate-fade-in relative z-10">
          <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <p class="font-semibold text-emerald-300">¡Registro exitoso!</p>
            <p class="text-[11px] text-emerald-400/80 mt-0.5">{{ successMessage() }}</p>
          </div>
        </div>
      }

      @if (errorMessage()) {
        <div class="mb-5 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs text-red-400 flex items-start gap-3 animate-fade-in relative z-10">
          <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <p class="font-semibold text-red-300">Ha ocurrido un error</p>
            <p class="text-[11px] text-red-400/80 mt-0.5">{{ errorMessage() }}</p>
          </div>
        </div>
      }

      <!-- Form -->
      <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()" class="relative z-10 flex flex-col gap-5">
        
        <!-- Tab Select for Transaction Type -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-400">Tipo de Movimiento</label>
          <div class="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800/80">
            <button
              type="button"
              (click)="setTipo('egreso')"
              [class]="tipoSelected() === 'egreso' 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-semibold shadow-md' 
                : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'"
              class="py-2 px-3 rounded-xl text-xs transition-all border flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Egreso
            </button>
            <button
              type="button"
              (click)="setTipo('ingreso')"
              [class]="tipoSelected() === 'ingreso' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold shadow-md' 
                : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'"
              class="py-2 px-3 rounded-xl text-xs transition-all border flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Ingreso
            </button>
            <button
              type="button"
              (click)="setTipo('pago_deuda')"
              [class]="tipoSelected() === 'pago_deuda' 
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 font-semibold shadow-md' 
                : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'"
              class="py-2 px-3 rounded-xl text-xs transition-all border flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Pago Deuda
            </button>
          </div>
        </div>

        <!-- Amount Input -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-400" for="monto">Monto de la Transacción</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">$</span>
            <input
              id="monto"
              type="number"
              formControlName="monto"
              placeholder="0.00"
              min="0.01"
              step="any"
              class="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-base font-medium text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          @if (transactionForm.controls.monto.touched && transactionForm.controls.monto.invalid) {
            <div class="text-[11px] text-red-400 pl-1 mt-0.5">
              @if (transactionForm.controls.monto.errors?.['required']) { El monto es requerido. }
              @if (transactionForm.controls.monto.errors?.['min']) { El monto debe ser mayor a cero. }
            </div>
          }
        </div>

        <!-- Accounts Select Block (Origin) -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-400" for="cuentaOrigenId">
            {{ tipoSelected() === 'pago_deuda' ? 'Cuenta de Origen (Pago de fondos)' : 'Cuenta Asociada' }}
          </label>
          <div class="relative">
            <select
              id="cuentaOrigenId"
              formControlName="cuentaOrigenId"
              class="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled selected>Selecciona una cuenta</option>
              @for (cuenta of cuentasOrigenFiltradas(); track cuenta.id) {
                <option [value]="cuenta.id" class="bg-slate-900 text-white">
                  {{ cuenta.nombre }} (Saldo: $&nbsp;{{ cuenta.saldo.toLocaleString() }})
                </option>
              }
            </select>
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
          @if (cuentasOrigenFiltradas().length === 0) {
            <p class="text-[10px] text-amber-400 pl-1">⚠️ No tienes cuentas de tipo crédito disponibles. Crea una primero para transaccionar.</p>
          }
          @if (transactionForm.controls.cuentaOrigenId.touched && transactionForm.controls.cuentaOrigenId.invalid) {
            <div class="text-[11px] text-red-400 pl-1 mt-0.5">La cuenta es obligatoria.</div>
          }
        </div>

        <!-- Debt Destination Account (Only for 'pago_deuda') -->
        @if (tipoSelected() === 'pago_deuda') {
          <div class="flex flex-col gap-1.5 animate-fade-in">
            <label class="text-xs font-semibold text-slate-400" for="cuentaDestinoDeudaId">Cuenta de Deuda (Abonar a)</label>
            <div class="relative">
              <select
                id="cuentaDestinoDeudaId"
                formControlName="cuentaDestinoDeudaId"
                class="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled selected>Selecciona la cuenta de deuda</option>
                @for (deuda of cuentasDeudaFiltradas(); track deuda.id) {
                  <option [value]="deuda.id" class="bg-slate-900 text-white">
                    {{ deuda.nombre }} (Deuda Pendiente: $&nbsp;{{ deuda.saldo.toLocaleString() }})
                  </option>
                }
              </select>
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
            @if (cuentasDeudaFiltradas().length === 0) {
              <p class="text-[10px] text-amber-400 pl-1">⚠️ No posees cuentas de tipo Deuda registradas.</p>
            }
            @if (transactionForm.controls.cuentaDestinoDeudaId.touched && transactionForm.controls.cuentaDestinoDeudaId.invalid) {
              <div class="text-[11px] text-red-400 pl-1 mt-0.5">La cuenta de deuda de destino es obligatoria para este tipo de movimiento.</div>
            }
          </div>
        }

        <!-- Category Select Block (Filtered dynamically, hidden or set for pago_deuda) -->
        @if (tipoSelected() !== 'pago_deuda') {
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-400" for="categoria">Categoría</label>
            <div class="relative">
              <select
                id="categoria"
                formControlName="categoria"
                class="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled selected>Selecciona una categoría</option>
                @for (cat of categoriasFiltradas(); track cat.id) {
                  <option [value]="cat.nombre" class="bg-slate-900 text-white">{{ cat.nombre }}</option>
                }
              </select>
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
            @if (categoriasFiltradas().length === 0) {
              <p class="text-[10px] text-slate-500 pl-1">No hay categorías personalizadas de este tipo aún. Puedes crear una desde la sección de categorías.</p>
            }
            @if (transactionForm.controls.categoria.touched && transactionForm.controls.categoria.invalid) {
              <div class="text-[11px] text-red-400 pl-1 mt-0.5">La categoría es requerida.</div>
            }
          </div>
        }

        <!-- Description Input -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-400" for="descripcion">Descripción / Notas</label>
          <input
            id="descripcion"
            type="text"
            formControlName="descripcion"
            placeholder="Ej. Súper semanal, abono tarjeta, salario..."
            class="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
          />
        </div>

        <!-- Date Picker -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-400" for="fecha">Fecha del Movimiento</label>
          <input
            id="fecha"
            type="date"
            formControlName="fecha"
            class="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all [color-scheme:dark]"
          />
          @if (transactionForm.controls.fecha.touched && transactionForm.controls.fecha.invalid) {
            <div class="text-[11px] text-red-400 pl-1 mt-0.5">La fecha es requerida.</div>
          }
        </div>

        <!-- Submit Button -->
        <button
          id="transaction-submit-btn"
          type="submit"
          [disabled]="loading() || transactionForm.invalid"
          class="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-3.5 px-4 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-[0.98] mt-2"
        >
          @if (loading()) {
            <svg class="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Procesando Transacción...</span>
          } @else {
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Confirmar Movimiento</span>
          }
        </button>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionForm {
  private financeService = inject(FinanceService);

  loading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // Signal del tipo actualmente seleccionado
  tipoSelected = signal<'ingreso' | 'egreso' | 'pago_deuda'>('egreso');

  // Lectura de datos en tiempo real convertida a Signals reactivos
  cuentas = toSignal(this.financeService.getCuentas(), { initialValue: [] });
  categorias = toSignal(this.financeService.getCategorias(), { initialValue: [] });

  // Cuentas de origen filtradas (cuentas de crédito / ahorro ordinarias)
  cuentasOrigenFiltradas = computed(() => {
    return this.cuentas().filter((c: Cuenta) => c.tipo === 'credito');
  });

  // Cuentas de destino (solo deudas)
  cuentasDeudaFiltradas = computed(() => {
    return this.cuentas().filter((c: Cuenta) => c.tipo === 'deuda');
  });

  // Categorías filtradas por tipo de transacción seleccionado
  categoriasFiltradas = computed(() => {
    const tipo = this.tipoSelected();
    const cats = this.categorias();
    if (tipo === 'ingreso') {
      return cats.filter((c: Categoria) => c.tipo === 'ingreso' || c.tipo === 'ambos');
    } else {
      return cats.filter((c: Categoria) => c.tipo === 'egreso' || c.tipo === 'ambos');
    }
  });

  // Inicialización del Formulario Reactivo
  transactionForm = new FormGroup({
    tipo: new FormControl<'ingreso' | 'egreso' | 'pago_deuda'>('egreso', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    monto: new FormControl<number | null>(null, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0.01)]
    }),
    cuentaOrigenId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    cuentaDestinoDeudaId: new FormControl(''),
    categoria: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    descripcion: new FormControl('', { nonNullable: true }),
    fecha: new FormControl(this.getTodayDateString(), {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  constructor() {
    // Escucha cambios del select de tipo para actualizar dinámicamente las validaciones
    this.transactionForm.get('tipo')?.valueChanges.subscribe(val => {
      if (val) {
        this.tipoSelected.set(val);
        this.onTipoChange(val);
      }
    });
  }

  setTipo(tipo: 'ingreso' | 'egreso' | 'pago_deuda') {
    this.transactionForm.get('tipo')?.setValue(tipo);
  }

  onTipoChange(tipo: 'ingreso' | 'egreso' | 'pago_deuda') {
    const categoriaCtrl = this.transactionForm.get('categoria');
    const cuentaDestinoDeudaCtrl = this.transactionForm.get('cuentaDestinoDeudaId');

    if (tipo === 'pago_deuda') {
      // No requiere una selección obligatoria de categorías comunes (se usa 'Pago de Deuda')
      categoriaCtrl?.clearValidators();
      categoriaCtrl?.setValue('Pago de Deuda');

      // Sí es estrictamente obligatorio seleccionar qué deuda se está pagando
      cuentaDestinoDeudaCtrl?.setValidators([Validators.required]);
    } else {
      // Requiere elegir una categoría normal
      categoriaCtrl?.setValidators([Validators.required]);
      if (categoriaCtrl?.value === 'Pago de Deuda') {
        categoriaCtrl.setValue('');
      }

      // No aplica una cuenta de deuda destino
      cuentaDestinoDeudaCtrl?.clearValidators();
      cuentaDestinoDeudaCtrl?.setValue('');
    }

    categoriaCtrl?.updateValueAndValidity();
    cuentaDestinoDeudaCtrl?.updateValueAndValidity();
  }

  async onSubmit(): Promise<void> {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const formValues = this.transactionForm.getRawValue();

    try {
      await this.financeService.registrarMovimiento({
        monto: formValues.monto!,
        tipo: formValues.tipo,
        categoria: formValues.categoria,
        descripcion: formValues.descripcion,
        fecha: formValues.fecha,
        cuentaOrigenId: formValues.cuentaOrigenId,
        cuentaDestinoDeudaId: formValues.tipo === 'pago_deuda' ? formValues.cuentaDestinoDeudaId || undefined : undefined
      });

      this.successMessage.set('El movimiento se registró exitosamente y tus saldos se actualizaron.');
      this.resetForm();
    } catch (err: any) {
      console.error('Error al guardar transacción:', err);
      this.errorMessage.set(err.message || 'Error al procesar el registro en la base de datos.');
    } finally {
      this.loading.set(false);
    }
  }

  private resetForm() {
    this.transactionForm.reset({
      tipo: 'egreso',
      monto: null as any,
      cuentaOrigenId: '',
      cuentaDestinoDeudaId: '',
      categoria: '',
      descripcion: '',
      fecha: this.getTodayDateString()
    });
    this.tipoSelected.set('egreso');
    this.onTipoChange('egreso');
  }

  private getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

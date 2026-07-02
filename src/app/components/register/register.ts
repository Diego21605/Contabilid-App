import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Validador personalizado síncrono para comprobar que ambas contraseñas coinciden.
 */
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#0f172a] text-slate-200 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <!-- Ambient Decorative Gradients -->
      <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div class="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
        <!-- Logo and Title -->
        <div class="text-center mb-8">
          <div class="inline-flex bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/25 mb-4">
            <svg class="w-8 h-8 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white tracking-tight">Crea tu Cuenta</h2>
          <p class="text-xs text-slate-400 mt-1.5">Regístrate para comenzar a administrar tus movimientos contables</p>
        </div>

        <!-- Error Notification -->
        @if (errorMessage()) {
          <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 flex items-start gap-2.5 mb-6">
            <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <!-- Register Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
          <!-- Email Input -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-400" for="email">Correo Electrónico</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="tu@correo.com"
                class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
            </div>
            <!-- Validation Messages -->
            @if (registerForm.controls.email.touched && registerForm.controls.email.invalid) {
              <div class="text-[11px] text-red-400 mt-0.5 pl-1">
                @if (registerForm.controls.email.errors?.['required']) {
                  El correo electrónico es requerido.
                }
                @if (registerForm.controls.email.errors?.['email']) {
                  Por favor introduce un correo válido.
                }
              </div>
            }
          </div>

          <!-- Password Input -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-400" for="password">Contraseña</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="Mínimo 6 caracteres"
                class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
            </div>
            <!-- Validation Messages -->
            @if (registerForm.controls.password.touched && registerForm.controls.password.invalid) {
              <div class="text-[11px] text-red-400 mt-0.5 pl-1">
                @if (registerForm.controls.password.errors?.['required']) {
                  La contraseña es requerida.
                }
                @if (registerForm.controls.password.errors?.['minlength']) {
                  La contraseña debe tener al menos 6 caracteres.
                }
              </div>
            }
          </div>

          <!-- Confirm Password Input -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-400" for="confirmPassword">Confirmar Contraseña</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                placeholder="Repite tu contraseña"
                class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
            </div>
            <!-- Validation Messages -->
            @if (registerForm.controls.confirmPassword.touched && registerForm.invalid) {
              <div class="text-[11px] text-red-400 mt-0.5 pl-1">
                @if (registerForm.controls.confirmPassword.errors?.['required']) {
                  Por favor confirma tu contraseña.
                }
                @if (registerForm.errors?.['passwordMismatch']) {
                  Las contraseñas no coinciden.
                }
              </div>
            }
          </div>

          <!-- Submit Button -->
          <button
            id="register-submit-btn"
            type="submit"
            [disabled]="loading() || registerForm.invalid"
            class="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            @if (loading()) {
              <svg class="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creando Cuenta...</span>
            } @else {
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Registrarse</span>
            }
          </button>
        </form>

        <!-- Redirect to Login -->
        <div class="text-center mt-6 pt-5 border-t border-white/5">
          <p class="text-xs text-slate-400">
            ¿Ya tienes una cuenta?
            <a routerLink="/login" class="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors ml-1 cursor-pointer">
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // Formulario Reactivo con Validaciones Estrictas y Validación de contraseña coincidente
  registerForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  }, {
    validators: [passwordMatchValidator]
  });

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.registerForm.getRawValue();

    try {
      await this.authService.register(email, password);
      // Redirigir al panel o vista principal
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      console.error('Error de registro:', err);
      // Formatear error de Firebase para mayor claridad
      let msg = 'Error al registrar tu cuenta. Intenta de nuevo.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Este correo electrónico ya está registrado por otro usuario.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'El formato de correo electrónico no es válido.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'La contraseña es demasiado débil (debe tener al menos 6 caracteres).';
      } else if (err.message) {
        msg = err.message;
      }
      this.errorMessage.set(msg);
    } finally {
      this.loading.set(false);
    }
  }
}

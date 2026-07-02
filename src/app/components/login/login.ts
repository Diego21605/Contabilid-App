import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
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
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white tracking-tight">Bienvenido a Contabilid-App</h2>
          <p class="text-xs text-slate-400 mt-1.5">Inicia sesión para gestionar tus libros contables con Firebase</p>
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

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
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
                placeholder="ejemplo@correo.com"
                class="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
            </div>
            <!-- Validation Messages -->
            @if (loginForm.controls.email.touched && loginForm.controls.email.invalid) {
              <div class="text-[11px] text-red-400 mt-0.5 pl-1">
                @if (loginForm.controls.email.errors?.['required']) {
                  El correo electrónico es requerido.
                }
                @if (loginForm.controls.email.errors?.['email']) {
                  Por favor introduce un correo válido.
                }
              </div>
            }
          </div>

          <!-- Password Input -->
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center">
              <label class="text-xs font-semibold text-slate-400" for="password">Contraseña</label>
            </div>
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
            @if (loginForm.controls.password.touched && loginForm.controls.password.invalid) {
              <div class="text-[11px] text-red-400 mt-0.5 pl-1">
                @if (loginForm.controls.password.errors?.['required']) {
                  La contraseña es requerida.
                }
                @if (loginForm.controls.password.errors?.['minlength']) {
                  La contraseña debe tener al menos 6 caracteres.
                }
              </div>
            }
          </div>

          <!-- Submit Button -->
          <button
            id="login-submit-btn"
            type="submit"
            [disabled]="loading() || loginForm.invalid"
            class="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            @if (loading()) {
              <svg class="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Autenticando...</span>
            } @else {
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Iniciar Sesión</span>
            }
          </button>
        </form>

        <!-- Redirect to Register -->
        <div class="text-center mt-6 pt-5 border-t border-white/5">
          <p class="text-xs text-slate-400">
            ¿No tienes una cuenta aún?
            <a routerLink="/register" class="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors ml-1 cursor-pointer">
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // Formulario Reactivo con Validaciones Estrictas
  loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    })
  });

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.getRawValue();

    try {
      await this.authService.login(email, password);
      // Redirigir al panel o vista principal protegida
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      console.error('Error de login:', err);
      // Formatear error de Firebase para mayor claridad
      let msg = 'Error de inicio de sesión. Verifica tus credenciales.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Credenciales inválidas. Comprueba tu correo y contraseña.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'El formato de correo electrónico no es válido.';
      } else if (err.message) {
        msg = err.message;
      }
      this.errorMessage.set(msg);
    } finally {
      this.loading.set(false);
    }
  }
}

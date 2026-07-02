import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Funcional Guard de Angular (CanActivateFn) para proteger rutas en Contabilid-App.
 * Verifica si hay una sesión activa de Firebase Auth.
 * Si no está autenticado, redirige al Login de manera reactiva.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map((user) => {
      if (user) {
        return true;
      } else {
        // Redirige al Login si no hay usuario activo
        return router.createUrlTree(['/login']);
      }
    })
  );
};

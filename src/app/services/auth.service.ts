import { Injectable, inject, Signal } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Inyección de dependencia utilizando la función inject() recomendada en Angular moderno
  private auth: Auth = inject(Auth);

  // 1. Observable que emite el estado del usuario en tiempo real (activo/inactivo/nulo)
  public user$: Observable<User | null> = authState(this.auth);

  // 2. Signal de Angular que expone el usuario actual de forma síncrona y reactiva
  public currentUser: Signal<User | null | undefined> = toSignal(this.user$);

  constructor() {}

  /**
   * Registra un nuevo usuario en Firebase Auth con correo y contraseña.
   * @param email Correo electrónico del usuario
   * @param password Contraseña elegida
   */
  async register(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error en el registro de AuthService:', error);
      throw error;
    }
  }

  /**
   * Inicia sesión de un usuario existente con correo y contraseña.
   * @param email Correo electrónico del usuario
   * @param password Contraseña correspondiente
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error en el inicio de sesión de AuthService:', error);
      throw error;
    }
  }

  /**
   * Cierra la sesión activa del usuario actual.
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error al cerrar sesión en AuthService:', error);
      throw error;
    }
  }
}

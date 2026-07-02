import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { routes } from './app.routes';
import { firebaseConfig } from './firebase-config'; // Keep configuration organized

export const appConfig: ApplicationConfig = {
  providers: [
    // Proveedor del Enrutador Angular con nuestras rutas registradas
    provideRouter(routes),
    
    // Inicialización del ecosistema Firebase en Angular de manera Standalone
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};

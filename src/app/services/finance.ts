import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  addDoc, 
  query, 
  orderBy, 
  runTransaction,
  getDocs,
  limit,
  deleteDoc
} from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, auth: Auth) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface Cuenta {
  id?: string;
  nombre: string;
  tipo: 'deuda' | 'credito'; // Deuda (p.ej. tarjeta de crédito, préstamo) o Crédito/Activo (p.ej. efectivo, cuenta bancaria)
  saldo: number;
  fechaCreacion: string;
}

export interface Categoria {
  id?: string;
  nombre: string;
  tipo: 'ingreso' | 'egreso' | 'ambos';
  color?: string;
  fechaCreacion: string;
}

export interface Movimiento {
  id?: string;
  monto: number;
  tipo: 'ingreso' | 'egreso' | 'pago_deuda';
  categoria: string;
  descripcion: string;
  fecha: string;
  cuentaOrigenId?: string; // Cuenta de donde sale o entra el dinero
  cuentaDestinoDeudaId?: string; // Cuenta de deuda a la que se le realiza el pago (solo si tipo === 'pago_deuda')
  fechaCreacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  /**
    * Verifica si el usuario tiene cuentas registradas y, si está vacío,
    * siembra las cuentas, categorías y transacciones por defecto.
    */
  async seedDefaultDataIfEmpty(uid: string): Promise<void> {
    const path = `usuarios/${uid}/cuentas`;
    try {
      const cuentasRef = collection(this.firestore, path);
      const cuentasSnap = await getDocs(query(cuentasRef, limit(1)));
      if (cuentasSnap.empty) {
        console.log('Sembrando cuentas por defecto...');
        // Cuentas predeterminadas
        const defaultAccounts = [
          { nombre: 'Efectivo Personal', tipo: 'credito' as const, saldo: 1500.00, fechaCreacion: new Date().toISOString() },
          { nombre: 'Banco Ahorros', tipo: 'credito' as const, saldo: 3450.00, fechaCreacion: new Date().toISOString() },
          { nombre: 'Tarjeta Visa Oro', tipo: 'deuda' as const, saldo: 850.00, fechaCreacion: new Date().toISOString() }
        ];
        
        const createdAccountIds: string[] = [];
        for (const c of defaultAccounts) {
          const docRef = await addDoc(cuentasRef, c);
          createdAccountIds.push(docRef.id);
        }

        console.log('Sembrando categorías por defecto...');
        // Categorías predeterminadas
        const categoriasRef = collection(this.firestore, `usuarios/${uid}/categorias`);
        const defaultCategories = [
          { nombre: 'Sueldo', tipo: 'ingreso' as const, fechaCreacion: new Date().toISOString() },
          { nombre: 'Inversión', tipo: 'ingreso' as const, fechaCreacion: new Date().toISOString() },
          { nombre: 'Ventas', tipo: 'ingreso' as const, fechaCreacion: new Date().toISOString() },
          { nombre: 'Freelance', tipo: 'ingreso' as const, fechaCreacion: new Date().toISOString() },
          { nombre: 'Alimentos', tipo: 'egreso' as const, fechaCreacion: new Date().toISOString() },
          { nombre: 'Alquiler', tipo: 'egreso' as const, fechaCreacion: new Date().toISOString() },
          { nombre: 'Servicios', tipo: 'egreso' as const, fechaCreacion: new Date().toISOString() },
          { nombre: 'Transporte', tipo: 'egreso' as const, fechaCreacion: new Date().toISOString() },
          { nombre: 'Ocio', tipo: 'egreso' as const, fechaCreacion: new Date().toISOString() },
          { nombre: 'Salud', tipo: 'egreso' as const, fechaCreacion: new Date().toISOString() },
          { nombre: 'Otros', tipo: 'ambos' as const, fechaCreacion: new Date().toISOString() }
        ];
        for (const cat of defaultCategories) {
          await addDoc(categoriasRef, cat);
        }

        console.log('Sembrando transacciones iniciales por defecto...');
        // Movimientos iniciales para tener un panel visualmente atractivo
        const movimientosRef = collection(this.firestore, `usuarios/${uid}/movimientos`);
        const todayDate = new Date().toISOString().split('T')[0];
        const defaultMovimientos = [
          { monto: 3000.00, tipo: 'ingreso' as const, categoria: 'Sueldo', descripcion: 'Nómina Mensual', fecha: todayDate, fechaCreacion: new Date().toISOString() },
          { monto: 450.00, tipo: 'egreso' as const, categoria: 'Alimentos', descripcion: 'Supermercado Mensual', fecha: todayDate, fechaCreacion: new Date(Date.now() + 1000).toISOString() },
          { monto: 150.00, tipo: 'egreso' as const, categoria: 'Servicios', descripcion: 'Luz e Internet', fecha: todayDate, fechaCreacion: new Date(Date.now() + 2000).toISOString() },
          { monto: 250.00, tipo: 'egreso' as const, categoria: 'Ocio', descripcion: 'Cenas y Salidas', fecha: todayDate, fechaCreacion: new Date(Date.now() + 3000).toISOString() }
        ];
        const primaryAccountId = createdAccountIds[0] || '';
        for (const mov of defaultMovimientos) {
          await addDoc(movimientosRef, {
            ...mov,
            cuentaOrigenId: primaryAccountId
          });
        }
        console.log('¡Siembre de datos completado!');
      }
    } catch (error) {
      console.error('Error sembrando datos por defecto:', error);
    }
  }

  /**
    * Obtiene un Observable que emite las cuentas del usuario autenticado en tiempo real.
    */
  getCuentas(): Observable<Cuenta[]> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (!user) return of([]);
        // Siembra de forma asíncrona pero sin bloquear la suscripción
        this.seedDefaultDataIfEmpty(user.uid);
        const cuentasRef = collection(this.firestore, `usuarios/${user.uid}/cuentas`);
        const q = query(cuentasRef, orderBy('nombre', 'asc'));
        return collectionData(q, { idField: 'id' }) as Observable<Cuenta[]>;
      })
    );
  }

  /**
    * Crea una nueva cuenta (de crédito o de deuda) para el usuario autenticado.
    */
  async crearCuenta(cuenta: Omit<Cuenta, 'id' | 'fechaCreacion'>): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado para crear cuenta.');

    const path = `usuarios/${user.uid}/cuentas`;
    try {
      const cuentasRef = collection(this.firestore, path);
      const nuevaCuenta: Omit<Cuenta, 'id'> = {
        ...cuenta,
        fechaCreacion: new Date().toISOString()
      };

      const docRef = await addDoc(cuentasRef, nuevaCuenta);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path, this.auth);
      throw error;
    }
  }

  /**
    * Obtiene un Observable que emite las categorías personalizadas del usuario autenticado en tiempo real.
    */
  getCategorias(): Observable<Categoria[]> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (!user) return of([]);
        const categoriasRef = collection(this.firestore, `usuarios/${user.uid}/categorias`);
        const q = query(categoriasRef, orderBy('nombre', 'asc'));
        return collectionData(q, { idField: 'id' }) as Observable<Categoria[]>;
      })
    );
  }

  /**
    * Crea una nueva categoría para el usuario autenticado.
    */
  async crearCategoria(categoria: Omit<Categoria, 'id' | 'fechaCreacion'>): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado para crear categoría.');

    const path = `usuarios/${user.uid}/categorias`;
    try {
      const categoriasRef = collection(this.firestore, path);
      const nuevaCategoria: Omit<Categoria, 'id'> = {
        ...categoria,
        fechaCreacion: new Date().toISOString()
      };

      const docRef = await addDoc(categoriasRef, nuevaCategoria);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path, this.auth);
      throw error;
    }
  }

  /**
    * Obtiene un Observable que emite los movimientos del usuario autenticado en tiempo real ordenados por fecha descendente.
    */
  getMovimientos(): Observable<Movimiento[]> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (!user) return of([]);
        const movimientosRef = collection(this.firestore, `usuarios/${user.uid}/movimientos`);
        const q = query(movimientosRef, orderBy('fecha', 'desc'));
        return collectionData(q, { idField: 'id' }) as Observable<Movimiento[]>;
      })
    );
  }

  /**
    * Registra un movimiento transaccional de manera atómica, actualizando los saldos
    * de las cuentas correspondientes en Firestore.
    */
  async registrarMovimiento(movimiento: Omit<Movimiento, 'id' | 'fechaCreacion'>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado para registrar movimientos.');

    const uid = user.uid;
    const path = `usuarios/${uid}/movimientos`;
    const movimientoConFecha: Omit<Movimiento, 'id'> = {
      ...movimiento,
      fechaCreacion: new Date().toISOString()
    };

    try {
      // Usar una transacción de Firestore para garantizar consistencia atómica de los datos
      await runTransaction(this.firestore, async (transaction) => {
        const movimientosColRef = collection(this.firestore, path);
        const nuevoMovimientoDocRef = doc(movimientosColRef);

        // CASO A: Ingreso o Egreso tradicional
        if (movimiento.tipo === 'ingreso' || movimiento.tipo === 'egreso') {
          if (!movimiento.cuentaOrigenId) {
            throw new Error('Se requiere una cuenta para asociar este movimiento.');
          }

          const cuentaRef = doc(this.firestore, `usuarios/${uid}/cuentas/${movimiento.cuentaOrigenId}`);
          const cuentaSnap = await transaction.get(cuentaRef);
          if (!cuentaSnap.exists()) {
            throw new Error('La cuenta especificada no existe.');
          }

          const saldoActual = cuentaSnap.data()['saldo'] || 0;
          const nuevoSaldo = movimiento.tipo === 'ingreso'
            ? saldoActual + movimiento.monto
            : saldoActual - movimiento.monto;

          transaction.update(cuentaRef, { saldo: nuevoSaldo });
        }

        // CASO B: Pago a deuda
        if (movimiento.tipo === 'pago_deuda') {
          if (!movimiento.cuentaOrigenId) {
            throw new Error('Se requiere una cuenta de origen (de dónde sale el dinero) para el pago.');
          }
          if (!movimiento.cuentaDestinoDeudaId) {
            throw new Error('Se requiere especificar la cuenta de deuda a la que se abona.');
          }

          const cuentaOrigenRef = doc(this.firestore, `usuarios/${uid}/cuentas/${movimiento.cuentaOrigenId}`);
          const cuentaDeudaRef = doc(this.firestore, `usuarios/${uid}/cuentas/${movimiento.cuentaDestinoDeudaId}`);

          const [origenSnap, deudaSnap] = await Promise.all([
            transaction.get(cuentaOrigenRef),
            transaction.get(cuentaDeudaRef)
          ]);

          if (!origenSnap.exists()) {
            throw new Error('La cuenta de origen de pago no existe.');
          }
          if (!deudaSnap.exists()) {
            throw new Error('La cuenta de deuda especificada no existe.');
          }

          const saldoOrigenActual = origenSnap.data()['saldo'] || 0;
          const saldoDeudaActual = deudaSnap.data()['saldo'] || 0;

          // El pago de deuda reduce el saldo de la cuenta de origen (gasto)
          transaction.update(cuentaOrigenRef, { saldo: saldoOrigenActual - movimiento.monto });

          // El pago de deuda reduce el balance de la deuda (saldo pendiente disminuye)
          transaction.update(cuentaDeudaRef, { saldo: saldoDeudaActual - movimiento.monto });
        }

        // Escribir el nuevo documento de movimiento en el lote de la transacción
        transaction.set(nuevoMovimientoDocRef, movimientoConFecha);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path, this.auth);
      throw error;
    }
  }

  /**
   * Elimina una cuenta de Firestore.
   */
  async eliminarCuenta(cuentaId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado para eliminar cuenta.');
    const path = `usuarios/${user.uid}/cuentas/${cuentaId}`;
    try {
      const docRef = doc(this.firestore, path);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path, this.auth);
      throw error;
    }
  }
}

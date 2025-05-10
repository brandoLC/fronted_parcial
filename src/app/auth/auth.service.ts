import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

// Interfaces
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol?: string; // Asegúrate que el formulario de registro y API manejen 'rol'
}

// Esta interfaz Usuario ahora coincide directamente con la respuesta del login
export interface Usuario {
  id: number; // o string, según tu base de datos
  nombre: string;
  apellido: string;
  email: string;
  rol?: string; // ej: 'student', 'teacher'
  activo?: boolean; // Basado en tu respuesta de Postman
  fechaCreacion?: string; // Basado en tu respuesta de Postman
  fechaActualizacion?: string; // Basado en tu respuesta de Postman
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.nestApiBase; // ej: 'http://localhost:3000'
  private readonly storageUserKey = 'currentUserData'; // Clave para guardar el objeto Usuario

  // BehaviorSubject para emitir el estado del usuario actual
  private currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUserDataFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private router = inject(Router);

  constructor(private http: HttpClient) {}

  /** POST /usuarios/login → devuelve el objeto Usuario y lo guarda en localStorage */
  login(dto: LoginPayload): Observable<Usuario> { // Devuelve Usuario directamente
    return this.http
      .post<Usuario>(`${this.base}/usuarios/login`, dto)// Ahora espera y devuelve Usuario directamente
      .pipe(
        tap(loggedInUser => {
          // Guardar los datos del usuario
          localStorage.setItem(this.storageUserKey, JSON.stringify(loggedInUser));
          // Notificar a los suscriptores que el usuario ha cambiado
          this.currentUserSubject.next(loggedInUser);
          // Redirigir al dashboard principal de la aplicación
          this.router.navigate(['/mis-cursos']); // O la ruta principal protegida
        })
      );
  }

  /** POST /usuarios (registro) */
  register(dto: RegisterPayload): Observable<Usuario> { // Asume que el registro devuelve el objeto Usuario creado
    // Asegúrate que la URL del endpoint sea la correcta para tu API NestJS de registro
    return this.http
      .post<Usuario>(`${this.base}/usuarios`, dto)
      .pipe(
        tap(createdUser => {
          console.log('Usuario registrado exitosamente:', createdUser);
          // No se loguea automáticamente aquí en este flujo.
          // El AuthPageComponent manejará el mensaje y el cambio a la vista de login.
        })
      );
  }

  /** Elimina los datos del usuario de localStorage y notifica */
  logout(): void {
    localStorage.removeItem(this.storageUserKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth']); // O la ruta raíz que muestra el AuthPageComponent
  }

  /** Obtiene los datos del usuario desde localStorage al inicio del servicio */
  private getUserDataFromStorage(): Usuario | null {
    const userDataString = localStorage.getItem(this.storageUserKey);
    if (userDataString) {
      try {
        return JSON.parse(userDataString) as Usuario;
      } catch (e) {
        console.error('Error al parsear datos de usuario desde localStorage', e);
        localStorage.removeItem(this.storageUserKey); // Limpiar dato corrupto
        return null;
      }
    }
    return null;
  }

  /** Usuario actual (valor síncrono) */
  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /** ¿Hay alguien logueado? (basado en la existencia de datos de usuario) */
  public get isLoggedIn(): boolean {
    // Si no hay token, la "autenticación" se basa en si tenemos datos de usuario guardados.
    // Esto es menos seguro que un token, pero funciona si la sesión se maneja por cookies HTTPOnly
    // o si las APIs protegidas validan la sesión de otra manera.
    return !!localStorage.getItem(this.storageUserKey);
  }

  /** ¿Tiene el usuario este rol? */
  public hasRole(expectedRole: string): boolean {
    return this.currentUserValue?.rol === expectedRole;
  }

  /** ID del usuario logueado */
  public get userId(): number | null { // o string | null
    return this.currentUserValue?.id ?? null;
  }

  /** Rol del usuario logueado */
  public get userRole(): string | null {
    return this.currentUserValue?.rol ?? null;
  }

  /** Token actual - Este método ahora es menos relevante si no hay token explícito */
  public getToken(): string | null {
    // Si tu autenticación NO se basa en un token JWT que el frontend deba manejar
    // (ej. si se basa en cookies de sesión HTTPOnly manejadas por el navegador/backend),
    // entonces este método no tendría un token que devolver.
    console.warn("AuthService.getToken() llamado, pero el flujo de login actual no provee un token JWT explícito al frontend.");
    return null; // Devolver null si no hay un token que el frontend deba manejar.
  }
}

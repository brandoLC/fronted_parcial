// src/app/auth/auth-page.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  AuthService,
  LoginPayload,
  RegisterPayload,
  Usuario
} from '../auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.css']
})
export class AuthPageComponent implements OnInit, OnDestroy {
  isSignUpMode = false;
  loginForm!: FormGroup;
  registerForm!: FormGroup;

  loginError:    string | null = null;
  registerError: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb:     FormBuilder,
    private auth:   AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      nombre:   ['', Validators.required],
      apellido: ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol:      ['', Validators.required]
    });
  }

  // Getters para acceder a los controles desde la plantilla
  get registerNombre()   { return this.registerForm.get('nombre'); }
  get registerApellido() { return this.registerForm.get('apellido'); }
  get registerEmail()    { return this.registerForm.get('email'); }
  get registerPassword() { return this.registerForm.get('password'); }
  get registerRol()      { return this.registerForm.get('rol'); }

  get loginEmail()    { return this.loginForm.get('email'); }
  get loginPassword() { return this.loginForm.get('password'); }

  switchToRegister(): void {
    this.isSignUpMode = true;
    this.loginError    = null;
    this.registerError = null;
    this.registerForm.reset({ rol: '' });
  }

  switchToLogin(): void {
    this.isSignUpMode = false;
    this.loginError    = null;
    this.registerError = null;
    this.loginForm.reset();
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loginError = null;

    const dto: LoginPayload = this.loginForm.value;
    this.auth.login(dto) // Asumimos que esto devuelve Observable<LoginApiResponse>
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        // Aquí estaba el problema si esperábamos LoginApiResponse:
        next: (user: Usuario) => { // <-- Estabas esperando Usuario, pero si auth.login devolvía LoginApiResponse, esto fallaba.
          console.log('Login exitoso', user); // user sería de tipo Usuario
          this.router.navigate(['/app/dashboard']);
        },
        // ***** TERMINA LA CORRECCIÓN AQUÍ *****
        error: (err) => {
          console.error('Error en login desde componente:', err);
          this.loginError = err?.error?.message || 'Correo o contraseña incorrectos.';
        }
      });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.registerError = null;

    const dto: RegisterPayload = this.registerForm.value;
    console.log('Registrando con payload:', dto);
    this.auth.register(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user: Usuario) => {
          console.log('Registro exitoso', user);
          alert('¡Cuenta creada exitosamente!');
          this.switchToLogin();
        },
        error: (err) => {
          console.error('Error registro:', err);
          this.registerError = err.error?.message || 'No se pudo registrar.';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

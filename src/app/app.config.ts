// src/app/app.config.ts

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Mejor rendimiento de zona
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Rutas
    provideRouter(routes),

    // HttpClient para peticiones HTTP
    provideHttpClient(),

    // Proveedores de FormsModule y ReactiveFormsModule
    importProvidersFrom(FormsModule, ReactiveFormsModule),
  ]
};

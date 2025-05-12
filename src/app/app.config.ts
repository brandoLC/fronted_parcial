// src/app/app.config.ts

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

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

    // Proveedor para CalendarModule
    importProvidersFrom(CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    })),
  ]
};

// src/app/services/orchestrator.service.ts

// 1) Modelos / DTOs que describe tu JSON
export interface Curso {
  codigo: number;
  nombre: string;
  horario: string;
  ciclo: string;
  profesor?: string; // Agregado para mostrar el profesor del curso
  promedioNota?: number; // Promedio de notas del curso
  created_at?: string; // Fecha de creación del curso
  mensajeNotas?: string; // Mensaje para indicar que no hay notas disponibles
  notas?: Nota[]; // Array to store notes for the course
}

export interface Nota {
  id_nota: number;
  valor:   number;
  fecha:   string;
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrchestratorService {
  private base = environment.orchApiBase;

  constructor(private http: HttpClient) {}

  getMisCursos(estId: number) {
    return this.http.get<Curso[]>(`${this.base}/estudiante/${estId}/cursos`);
  }

  getNotas(estId: number, cursoCodigo: number) {
    return this.http.get<Nota[]>(
      `${this.base}/estudiante/${estId}/curso/${cursoCodigo}/notas`
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          console.warn('No se encontraron notas para este estudiante en el curso especificado.');
          return of([]); // Retornar un array vacío si no hay notas
        }
        return throwError(() => error); // Propagar otros errores
      })
    );
  }
}

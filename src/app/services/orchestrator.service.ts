// src/app/services/orchestrator.service.ts

// 1) Modelos / DTOs que describe tu JSON
export interface Curso {
  codigo: number;
  nombre: string;
  horario: string;
  ciclo: string;
}

export interface Nota {
  id_nota: number;
  valor:   number;
  fecha:   string;
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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
    );
  }
}

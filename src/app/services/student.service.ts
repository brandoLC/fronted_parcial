import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Curso, Nota } from './orchestrator.service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private base = environment.orchApiBase;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los cursos en los que está inscrito el estudiante.
   * @param estId ID del estudiante
   * @param limit Límite de resultados por página
   * @param page Número de página
   */
  getCursosInscritos(estId: number, limit: number = 10, page: number = 1): Observable<Curso[]> {
    return this.http.get<any>(`${this.base}/estudiante/${estId}/cursos`, {
      params: { limit: limit.toString(), page: page.toString() }
    }).pipe(
      map(response => response.cursos || [])
    );
  }

  /**
   * Obtiene las notas de un curso específico.
   * @param estId ID del estudiante
   * @param cursoCodigo Código del curso
   */
  getNotas(estId: number, cursoCodigo: number): Observable<Nota[]> {
    return this.http.get<any>(`${this.base}/estudiante/${estId}/curso/${cursoCodigo}/notas`).pipe(
      map(response => response.notas || [])
    );
  }
}

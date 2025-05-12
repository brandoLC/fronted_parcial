import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Curso, Nota } from './orchestrator.service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private base = environment.goApiBase; // Updated to use the correct base URL for course details

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los cursos en los que está inscrito el estudiante.
   * @param estId ID del estudiante
   */
  getCursosInscritos(estId: number): Observable<{ cursos: Curso[] }> {
    return this.http.get<{ cursos: Curso[] }>(`${this.base}/estudiante/${estId}/cursos`);
  }

  /**
   * Obtiene las notas de un curso específico.
   * @param estId ID del estudiante
   * @param cursoCodigo Código del curso
   */
  getNotas(estId: number, cursoCodigo: number): Observable<Nota[]> {
    return this.http.get<{ notas: Nota[] }>(`${environment.orchApiBase}/estudiante/${estId}/curso/${cursoCodigo}/notas`).pipe(
      map(response => response.notas) // Extract the `notas` array from the response
    );
  }

  /**
   * Obtiene los detalles de un curso específico.
   * @param cursoCodigo Código del curso
   */
  getCursoDetalles(cursoCodigo: number): Observable<Curso> {
    return this.http.get<Curso>(`${this.base}/cursos/${cursoCodigo}`);
  }

  /**
   * Fetches the list of course IDs and enrollment dates for a student.
   * @param studentId The ID of the student.
   */
  getEstudianteCursos(studentId: number): Observable<{ EstudianteID: number; CursoCodigo: number; InscritoEn: string }[]> {
    return this.http.get<{ EstudianteID: number; CursoCodigo: number; InscritoEn: string }[]>(`${environment.goApiBase}/estudiante-cursos/estudiante/${studentId}`);
  }
}

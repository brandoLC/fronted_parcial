import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private goApiBase = environment.goApiBase;
  private orchApiBase = environment.orchApiBase;

  constructor(private http: HttpClient) {}

  listarCursosDisponibles(limit: number = 10, page: number = 1): Observable<any[]> {
    return this.http.get<any>(`${this.goApiBase}/cursos`, {
      params: { limit: limit.toString(), page: page.toString() }
    }).pipe(
      map(response => response.cursos || [])
    );
  }

  inscribirEstudiante(estudianteId: number, cursoCodigo: string): Observable<any> {
    return this.http.post(`${this.goApiBase}/estudiante-cursos`, {
      estudiante_id: estudianteId,
      curso_codigo: cursoCodigo
    });
  }

  verCursosInscritos(estudianteId: number): Observable<any[]> {
    return this.http.get<any>(`${this.orchApiBase}/estudiante/${estudianteId}/cursos`).pipe(
      map(response => response.cursos || [])
    );
  }

  eliminarInscripcion(estudianteId: number, cursoCodigo: string): Observable<any> {
    return this.http.delete(`${this.goApiBase}/estudiante-cursos`, {
      body: {
        estudiante_id: estudianteId,
        curso_codigo: cursoCodigo
      }
    });
  }
}

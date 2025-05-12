import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GradeService {
  private apiUrl = `${environment.fiberApiBase}/calificacion`;

  constructor(private http: HttpClient) {}

  listGrades(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createGrade(grade: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, grade);
  }

  deleteGrade(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getStudentGrades(studentId: string, courseCode: string): Observable<any[]> {
    const url = `${environment.orchApiBase}/estudiante/${studentId}/curso/${courseCode}/notas`;
    return this.http.get<any>(url).pipe(
      map(response => response.notas || [])
    );
  }

  // Adapted to handle new API response structure
  getStudentCourses(studentId: string, limit: number = 10, page: number = 1): Observable<any[]> {
    const url = `${environment.orchApiBase}/estudiante/${studentId}/cursos`;
    return this.http.get<any>(url, {
      params: { limit: limit.toString(), page: page.toString() }
    }).pipe(
      map(response => response.cursos || [])
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { GradeService } from '../../services/grade.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-grades',
  imports: [CommonModule, FormsModule],
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.css']
})
export class GradesComponent implements OnInit {
  coursesWithGrades: { courseName: string; grades: any[] }[] = [];

  constructor(private gradeService: GradeService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Obtener los datos del usuario logueado desde localStorage
    const storedUser = localStorage.getItem('currentUserData');
    const studentId = storedUser ? JSON.parse(storedUser).id : null;

    if (!studentId) {
      console.error('No se encontró el ID del estudiante en localStorage');
      return;
    }

    // Obtener los cursos del estudiante
    this.gradeService.getStudentCourses(studentId).subscribe(
      (courses) => {
        const courseRequests = courses.map((course) => {
          return this.gradeService.getStudentGrades(studentId, course.codigo).pipe(
            map((grades) => ({ courseName: course.nombre, grades })),
            catchError((error) => {
              if (error.status === 404) {
                console.warn(`No se encontraron notas para el curso ${course.codigo}`);
                return of({ courseName: course.nombre, grades: [] }); // Retornar curso sin notas
              }
              return throwError(() => error);
            })
          );
        });

        // Ejecutar todas las solicitudes y procesar los resultados
        forkJoin(courseRequests).subscribe(
          (results) => {
            this.coursesWithGrades = results;
            console.log('Cursos con notas:', this.coursesWithGrades);
          },
          (error) => console.error('Error al cargar las notas:', error)
        );
      },
      (error) => console.error('Error al cargar los cursos:', error)
    );
  }
}

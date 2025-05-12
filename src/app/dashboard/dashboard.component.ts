// src/app/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { OrchestratorService, Curso, Nota } from '../services/orchestrator.service';
import { AuthService, Usuario } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { Subject, of, throwError } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule],
})
export class DashboardComponent implements OnInit, OnDestroy {
  misCursos: Curso[] = [];
  totalCursos = 0;
  cursoActivo: Curso | null = null;
  notasSeleccionadas: Nota[] = [];
  promedioNotas: number = 0;
  notificaciones: string[] = [];
  private destroy$ = new Subject<void>();
  currentUser: Usuario | null = null;
  professorCourses: any[] = [];

  constructor(
    private orch: OrchestratorService,
    private auth: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const user: Usuario | null = this.auth.currentUserValue;
    if (!user) {
      this.router.navigate(['/auth']);
      return;
    }

    this.currentUser = user;

    if (user.rol === 'teacher') {
      if (this.notificaciones.length === 0) { // Ensure notifications are initialized only once
        this.notificaciones = [
          'Recuerda revisar las calificaciones de tus cursos.',
          'El curso de Matemáticas tiene un nuevo estudiante inscrito.',
          'La fecha límite para subir notas es el próximo viernes.'
        ];
      }

      this.http.get<any[]>(`http://Load-proyecto-1073641052.us-east-1.elb.amazonaws.com:3000/ejerce`).subscribe(assignments => {
        const courseIds = assignments
          .filter(a => a.profesor_id === user.id)
          .map(a => a.curso_id);

        const courseRequests = courseIds.map(id =>
          this.http.get<any>(`${environment.goApiBase}/cursos/${id}`).pipe(
            catchError(err => {
              if (err.status === 404) {
                console.warn(`El curso con ID ${id} no existe.`);
                return of(null);
              }
              return throwError(() => err);
            })
          )
        );

        forkJoin(courseRequests).subscribe(courses => {
          this.professorCourses = courses.map(course => ({
            ...course,
            totalEstudiantes: Math.floor(Math.random() * 50) + 1 // Simular número de estudiantes
          }));
          this.totalCursos = courses.length;
        });
      });
    }

    if (user.rol === 'student') {
      // Obtener los cursos inscritos del estudiante
      this.http.get<{ EstudianteID: number; CursoCodigo: number; InscritoEn: string }[]>(`${environment.goApiBase}/estudiante-cursos/estudiante/${user.id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe(cursos => {
          this.misCursos = Array.isArray(cursos) ? cursos.map(curso => ({
            codigo: curso.CursoCodigo,
            inscritoEn: curso.InscritoEn,
            nombre: '', // Inicializar con valores vacíos
            horario: '',
            ciclo: ''
          })) : [];
          this.totalCursos = this.misCursos.length; // Actualizar el total de cursos

          console.log('Contenido de misCursos:', this.misCursos);

          // Realizar llamadas individuales para cada curso para obtener las notas
          const notasObservables = this.misCursos.map(curso =>
            this.orch.getNotas(user.id, curso.codigo).pipe(
              takeUntil(this.destroy$),
              catchError(err => {
                if (err.status === 404) {
                  console.warn(`No se encontraron notas para el curso ${curso.codigo}`);
                  curso.mensajeNotas = 'No hay notas disponibles para este curso.'; // Agregar mensaje para la UI
                  return of([]); // Retornar un array vacío si no hay notas
                }
                return throwError(() => err);
              })
            )
          );

          forkJoin(notasObservables).subscribe({
            next: (notasArray: Nota[][]) => {
              notasArray.forEach((notas, index) => {
                if (notas.length > 0) {
                  const totalNotas = notas.reduce((sum, nota) => sum + nota.valor, 0);
                  this.misCursos[index].promedioNota = totalNotas / notas.length;
                } else {
                  this.misCursos[index].promedioNota = 0; // Sin notas
                }
              });
              this.calcularPromedioNotas();
            },
            error: err => {
              console.error('Error al cargar notas:', err);
            }
          });

          // Realizar llamadas individuales para obtener los detalles de cada curso
          const detallesObservables = this.misCursos.map(curso =>
            this.http.get<any>(`${environment.goApiBase}/cursos/${curso.codigo}`).pipe(
              takeUntil(this.destroy$),
              catchError(err => {
                if (err.status === 404) {
                  console.warn(`No se encontraron detalles para el curso ${curso.codigo}`);
                  return of(null); // Retornar null si no hay detalles
                }
                return throwError(() => err);
              })
            )
          );

          // Ajustar el manejo de detalles de cursos para omitir el campo `ciclo` si no está disponible
          forkJoin(detallesObservables).subscribe({
            next: (detallesArray: any[]) => {
              detallesArray.forEach((detalles, index) => {
                if (detalles) {
                  this.misCursos[index].nombre = detalles.nombre;
                  this.misCursos[index].horario = detalles.horario;
                  // Si `ciclo` no está disponible, dejarlo vacío
                  this.misCursos[index].ciclo = detalles.ciclo || '';
                } else {
                  this.misCursos[index].mensajeNotas = 'No hay notas disponibles para este curso.'; // Mensaje para cursos sin notas
                }
              });
            },
            error: err => {
              console.error('Error al cargar los detalles de los cursos:', err);
            }
          });
        });

      this.notificaciones = [
        'Recuerda revisar tus notas de Fundamentos de Programación.',
        'El examen final de Matemáticas es el próximo lunes.'
      ];
    }
  }

  verNotas(c: Curso) {
    if (this.cursoActivo === c) {
      this.cursoActivo = null;
      this.notasSeleccionadas = [];
      return;
    }

    const user: Usuario | null = this.auth.currentUserValue;
    if (!user) {
      this.router.navigate(['/auth']);
      return;
    }

    this.cursoActivo = c;
    this.http.get<any>(`http://load-proyecto-1073641052.us-east-1.elb.amazonaws.com:9000/estudiante/${user.id}/curso/${c.codigo}/notas`)
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          if (err.status === 404) {
            console.warn(`No se encontraron notas para el curso ${c.codigo}`);
            this.notasSeleccionadas = [];
            c.mensajeNotas = 'No hay notas disponibles para este curso.';
            return of(null);
          }
          return throwError(() => err);
        })
      )
      .subscribe({
        next: response => {
          if (response && response.notas) {
            this.notasSeleccionadas = response.notas;
            const totalNotas = this.notasSeleccionadas.reduce((sum, nota) => sum + nota.valor, 0);
            c.promedioNota = this.notasSeleccionadas.length > 0 ? totalNotas / this.notasSeleccionadas.length : 0;
          } else {
            this.notasSeleccionadas = [];
          }
          this.calcularPromedioNotas();
        },
        error: err => {
          console.error('Error al cargar notas:', err);
        }
      });
  }

  calcularPromedioNotas() {
    const cursosConNotas = this.misCursos.filter(curso => curso.promedioNota !== undefined && curso.promedioNota > 0);
    if (cursosConNotas.length > 0) {
      const totalNotas = cursosConNotas.reduce((sum, curso) => sum + (curso.promedioNota || 0), 0);
      this.promedioNotas = parseFloat((totalNotas / cursosConNotas.length).toFixed(2));
    } else {
      this.promedioNotas = 0;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

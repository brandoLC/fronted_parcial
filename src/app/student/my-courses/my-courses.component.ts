import { Component, OnInit } from '@angular/core';
import { OrchestratorService, Curso, Nota } from '../../services/orchestrator.service';
import { AuthService, Usuario } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course.service';
import { forkJoin, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.css']
})
export class MyCoursesComponent implements OnInit {
  misCursos: Curso[] = [];
  cursosOriginales: Curso[] = []; // Nueva propiedad para almacenar los cursos originales
  notasSeleccionadas: Nota[] = [];
  usuario: Usuario | null = null;
  cursoActivo: Curso | null = null;

  constructor(private courseService: CourseService, private authService: AuthService) {}

  ngOnInit(): void {
    this.usuario = this.authService.currentUserValue;
    if (this.usuario) {
      // Step 1: Fetch course IDs and enrollment dates using API 2
      this.courseService.getEstudianteCursos(this.usuario.id).subscribe({
        next: (inscripciones: { EstudianteID: number; CursoCodigo: number; InscritoEn: string }[]) => {
          const cursoRequests = inscripciones.map(inscripcion => {
            // Step 2: Fetch detailed course information using API 1
            return this.courseService.getCursoDetalles(inscripcion.CursoCodigo).pipe(
              map(cursoDetalles => {
                return {
                  codigo: cursoDetalles.codigo,
                  nombre: cursoDetalles.nombre,
                  ciclo: cursoDetalles.ciclo,
                  horario: cursoDetalles.horario,
                  inscritoEn: inscripcion.InscritoEn // Use enrollment date from API 2
                };
              })
            );
          });

          // Step 3: Fetch notes for each course
          forkJoin(cursoRequests).subscribe({
            next: (cursos: Curso[]) => {
              console.log('Cursos obtenidos:', cursos); // Debug log
              this.misCursos = cursos;
              this.cursosOriginales = [...this.misCursos]; // Save a copy of the original courses

              // Fetch notes for each course
              const notasRequests = this.misCursos.map(curso =>
                this.courseService.getNotas(this.usuario!.id, curso.codigo).pipe(
                  map(notas => {
                    curso.notas = notas; // Add notes to the course
                  }),
                  catchError(err => {
                    if (err.status === 404) {
                      console.warn(`No se encontraron notas para el curso ${curso.codigo}`);
                      curso.notas = []; // Set empty notes if 404
                      curso.mensajeNotas = 'No hay notas disponibles para este curso.'; // Add a message for the UI
                      return of(null);
                    }
                    return throwError(() => err);
                  })
                )
              );

              forkJoin(notasRequests).subscribe({
                next: () => {
                  console.log('Notas obtenidas para todos los cursos.');
                },
                error: err => {
                  console.error('Error al obtener las notas:', err);
                }
              });
            },
            error: err => {
              console.error('Error al obtener los detalles de los cursos:', err);
            }
          });
        },
        error: err => {
          console.error('Error al obtener los cursos inscritos:', err);
        }
      });
    }
  }

  verNotas(curso: Curso): void {
    if (this.cursoActivo === curso) {
      this.cursoActivo = null;
      this.notasSeleccionadas = [];
      return;
    }

    this.cursoActivo = curso;
    this.notasSeleccionadas = []; // Clear previous notes

    if (this.usuario) {
      this.courseService.getNotas(this.usuario.id, curso.codigo).subscribe({
        next: (notas) => {
          if (notas.length === 0) {
            curso.mensajeNotas = 'No hay notas disponibles para este curso.'; // Add a message for the UI
          } else {
            this.notasSeleccionadas = notas;
          }
        },
        error: (err) => {
          if (err.status === 404) {
            console.warn(`No se encontraron notas para el curso ${curso.codigo}`);
            curso.mensajeNotas = 'No hay notas disponibles para este curso.'; // Add a message for the UI
          } else {
            console.error('Error al obtener las notas:', err);
          }
        }
      });
    }
  }

  buscarCurso(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    if (query) {
      this.misCursos = this.cursosOriginales.filter(curso => curso.nombre.toLowerCase().includes(query));
    } else {
      this.misCursos = [...this.cursosOriginales]; // Restaurar los cursos originales si la barra de búsqueda está vacía
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { EnrollmentService } from '../../services/enrollment.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-enrollment',
  templateUrl: './enrollment.component.html',
  styleUrls: ['./enrollment.component.css'],
  imports: [CommonModule]
})
export class EnrollmentComponent implements OnInit {
  cursosDisponibles: any[] = [];
  cursosInscritos: any[] = [];
  estudianteId: number | null = null; // Obtener dinámicamente el ID del estudiante

  constructor(private enrollmentService: EnrollmentService, private authService: AuthService) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    this.estudianteId = currentUser?.id || null;

    if (this.estudianteId) {
      this.listarCursosDisponibles();
      this.verCursosInscritos();
    } else {
      console.error('No se encontró un usuario autenticado.');
    }
  }

  // Ensure `cursosDisponibles` is always an array
  listarCursosDisponibles(): void {
    this.enrollmentService.listarCursosDisponibles().subscribe({
      next: (cursos) => {
        this.cursosDisponibles = Array.isArray(cursos) ? cursos : Object.values(cursos);
        console.log('Cursos disponibles:', this.cursosDisponibles);
      },
      error: (err) => console.error('Error al listar cursos disponibles:', err)
    });
  }

  // Ensure `cursosInscritos` is always an array
  verCursosInscritos(): void {
    if (this.estudianteId) {
      this.enrollmentService.verCursosInscritos(this.estudianteId).subscribe({
        next: (cursos) => {
          this.cursosInscritos = Array.isArray(cursos) ? cursos : Object.values(cursos);
          console.log('Cursos inscritos:', this.cursosInscritos);
        },
        error: (err) => console.error('Error al ver cursos inscritos:', err)
      });
    }
  }

  inscribirEstudiante(cursoCodigo: string): void {
    if (this.estudianteId) {
      this.enrollmentService.inscribirEstudiante(this.estudianteId, cursoCodigo).subscribe({
        next: () => {
          this.listarCursosDisponibles();
          this.verCursosInscritos();
        },
        error: (err) => console.error('Error al inscribir estudiante:', err)
      });
    }
  }

  eliminarInscripcion(cursoCodigo: string): void {
    if (this.estudianteId) {
      this.enrollmentService.eliminarInscripcion(this.estudianteId, cursoCodigo).subscribe({
        next: () => this.verCursosInscritos(),
        error: (err) => console.error('Error al eliminar inscripción:', err)
      });
    }
  }

  estaInscrito(cursoCodigo: string): boolean {
    return this.cursosInscritos.some(curso => curso.codigo === cursoCodigo);
  }
}

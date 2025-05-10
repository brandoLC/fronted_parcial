// src/app/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrchestratorService, Curso, Nota } from '../services/orchestrator.service';
import { AuthService, Usuario} from '../auth/auth.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
  misCursos: Curso[] = [];
  totalCursos = 0;
  cursoActivo: Curso | null = null;
  notasSeleccionadas: Nota[] = [];

  constructor(
    private orch: OrchestratorService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // 1) Extraemos el usuario completo
    const user: Usuario | null = this.auth.currentUserValue;
    if (!user) {
      // No hay sesión: redirigir a login
      this.router.navigate(['/auth']);
      return;
    }

    // 2) Ya tenemos user.id como number
    this.orch.getMisCursos(user.id).subscribe({
      next: cursos => {
        this.misCursos = cursos;
        this.totalCursos = cursos.length;
      },
      error: err => {
        console.error('Error al cargar cursos:', err);
      }
    });
  }

  verNotas(c: Curso) {
    const user: Usuario | null = this.auth.currentUserValue;
    if (!user) {
      this.router.navigate(['/auth']);
      return;
    }

    this.cursoActivo = c;
    this.orch.getNotas(user.id, c.codigo).subscribe({
      next: notas => {
        this.notasSeleccionadas = notas;
      },
      error: err => {
        console.error('Error al cargar notas:', err);
      }
    });
  }
}

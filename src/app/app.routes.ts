import { Routes } from '@angular/router';
import { AuthPageComponent }    from './auth/auth-page/auth-page.component';
import { MainLayoutComponent }  from './layout/main-layout/main-layout.component';
import { DashboardComponent }   from './dashboard/dashboard.component';    // <— atención aquí
import { MyCoursesComponent }   from './student/my-courses/my-courses.component';
import { EnrollmentComponent }  from './student/enrollment/enrollment.component';
import { GradesComponent }      from './student/grades/grades.component';
import { ProfessorCoursesComponent } from './professor/professor-courses/professor-courses.component';
import { StudentListComponent }      from './professor/student-list/student-list.component';
import { GradeEntryComponent }       from './professor/grade-entry/grade-entry.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: 'auth', component: AuthPageComponent },
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'mis-cursos',     component: MyCoursesComponent },
      { path: 'inscribirme',    component: EnrollmentComponent },
      { path: 'calificaciones', component: GradesComponent },
      {
        path: 'gestion-cursos',
        component: ProfessorCoursesComponent,
        canActivate: [roleGuard],
        data: { role: 'profesor' }
      },
      {
        path: 'gestion-cursos/:id/estudiantes',
        component: StudentListComponent,
        canActivate: [roleGuard],
        data: { role: 'profesor' }
      },
      {
        path: 'gestion-cursos/:id/notas',
        component: GradeEntryComponent,
        canActivate: [roleGuard],
        data: { role: 'profesor' }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth', pathMatch: 'full' }
];

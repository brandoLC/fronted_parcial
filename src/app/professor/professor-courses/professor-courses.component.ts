import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-professor-courses',
  templateUrl: './professor-courses.component.html',
  styleUrls: ['./professor-courses.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ProfessorCoursesComponent implements OnInit {
  availableCourses: any[] = [];
  professorCourses: any[] = []; // To store courses the professor is already teaching
  professorId: number | null = null;
  showAvailableCourses: boolean = false; // State to toggle visibility

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.id) {
      this.professorId = currentUser.id;
      this.fetchProfessorCourses();
    }
  }

  toggleAvailableCourses(): void {
    this.showAvailableCourses = !this.showAvailableCourses;
    if (this.showAvailableCourses) {
      this.fetchAvailableCourses();
    }
  }

  fetchProfessorCourses(): void {
    if (!this.professorId) return;

    this.http.get<any[]>(`${environment.goApiBase}/ejerce`).subscribe(
      (assignments) => {
        this.professorCourses = assignments.filter(
          (assignment) => assignment.profesor_id === this.professorId
        ).map((assignment) => assignment.curso_id);
      },
      (error) => {
        console.error('Error fetching professor courses:', error);
      }
    );
  }

  fetchAvailableCourses(): void {
    this.http.get<any[]>(`${environment.goApiBase}/cursos`).subscribe(
      (courses) => {
        this.availableCourses = courses.filter(
          (course) => !this.professorCourses.includes(course.id)
        );
      },
      (error) => {
        console.error('Error fetching available courses:', error);
      }
    );
  }

  joinCourse(courseId: number): void {
    if (!this.professorId) {
      console.error('Professor ID is not available.');
      return;
    }

    const body = {
      profesor_id: this.professorId,
      curso_id: courseId
    };

    this.http.post(`${environment.goApiBase}/ejerce`, body).subscribe(
      () => {
        alert('Te has unido al curso exitosamente.');
        this.fetchAvailableCourses(); // Refresh the list of available courses
        this.fetchProfessorCourses(); // Refresh the list of professor's courses
      },
      (error) => {
        console.error('Error joining course:', error);
      }
    );
  }
}

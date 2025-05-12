import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { AuthService, Usuario } from '../../auth/auth.service';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FontAwesomeModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  currentYear = new Date().getFullYear();
  currentUser: Usuario | null = null;
  isStudent = false;
  isProfessor = false;

  constructor(private authService: AuthService, private router: Router, library: FaIconLibrary) {
    library.addIcons(faUserCircle);
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser   = user;
      this.isStudent     = user?.rol === 'student';
      this.isProfessor   = user?.rol === 'teacher';
    });
  }

  logout(): void {
    this.authService.logout();
  }
}

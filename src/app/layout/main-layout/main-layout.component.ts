import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { AuthService, Usuario } from '../../auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  currentYear = new Date().getFullYear();
  currentUser: Usuario | null = null;
  isStudent = false;
  isProfessor = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser   = user;
      this.isStudent     = user?.rol === 'student';
      this.isProfessor   = user?.rol === 'profesor';
    });
  }

  logout(): void {
    this.authService.logout();
  }
}

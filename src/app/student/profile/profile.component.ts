import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, FormsModule]
})
export class ProfileComponent implements OnInit {
  user: any = {};
  isEditing = false;

  constructor(private profileService: ProfileService, private authService: AuthService) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.profileService.getProfile(currentUser.id).subscribe(
        (data) => (this.user = data),
        (error) => console.error('Error fetching profile:', error)
      );
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  saveProfile(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.profileService.updateProfile(currentUser.id, this.user).subscribe(
        () => this.toggleEdit(),
        (error) => console.error('Error updating profile:', error)
      );
    }
  }
}
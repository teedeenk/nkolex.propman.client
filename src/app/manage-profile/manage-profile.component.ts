import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { ProfileService, Profile, UpdateProfileRequest } from '../services/profile.service';
import { AuthService } from '../services/auth.service';

const REQUEST_TIMEOUT_MS = 15000;

@Component({
  selector: 'app-manage-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-profile.component.html',
  styleUrls: ['./manage-profile.component.css'],
})
export class ManageProfileComponent implements OnInit {
  profile: Profile | null = null;
  private userId: string = '';

  isLoading: boolean = false;
  loadError: string | null = null;

  isEditing: boolean = false;
  editForm: UpdateProfileRequest = {
    name: '',
    surname: '',
    email: '',
    phoneNumber: '',
  };

  isSaving: boolean = false;
  saveError: string | null = null;
  saveSuccess: boolean = false;

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Always fetch a fresh userId from the server instead of trusting cached localStorage.
    this.isLoading = true;
    this.loadError = null;
    this.authService.loadProfile().subscribe({
      next: (profile) => {
        this.userId = profile.userId ?? '';
        if (!this.userId) {
          this.isLoading = false;
          this.loadError = 'Unable to determine your account. Please log in again.';
          return;
        }
        this.loadProfile();
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Unable to determine your account. Please log in again.';
      },
    });
  }

  private loadProfile(): void {
    this.isLoading = true;
    this.loadError = null;
    this.profileService
      .getProfile(this.userId)
      .pipe(
        timeout(REQUEST_TIMEOUT_MS),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => {
          this.profile = data;
        },
        error: (err) => {
          this.loadError =
            err?.name === 'TimeoutError'
              ? 'The request timed out. Please try again.'
              : 'Failed to load your profile. Please try again.';
        },
      });
  }

  fullName(): string {
    return this.profile ? `${this.profile.name} ${this.profile.surname}`.trim() : '';
  }

  startEdit(): void {
    if (!this.profile) return;

    this.editForm = {
      name: this.profile.name,
      surname: this.profile.surname,
      email: this.profile.email,
      phoneNumber: this.profile.phoneNumber,
    };
    this.saveError = null;
    this.saveSuccess = false;
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.saveError = null;
  }

  onSubmitEdit(): void {
    if (!this.profile) return;

    if (!this.editForm.name.trim() || !this.editForm.surname.trim() || !this.editForm.email.trim()) {
      this.saveError = 'Name, surname and email are required.';
      return;
    }

    this.isSaving = true;
    this.saveError = null;

    this.profileService
      .updateProfile(this.userId, this.editForm)
      .pipe(
        timeout(REQUEST_TIMEOUT_MS),
        finalize(() => (this.isSaving = false)),
      )
      .subscribe({
        next: (saved) => {
          this.profile = saved ?? { ...this.profile!, ...this.editForm };
          this.isEditing = false;
          this.saveSuccess = true;
          setTimeout(() => (this.saveSuccess = false), 3000);
        },
        error: (err) => {
          this.saveError =
            err?.name === 'TimeoutError'
              ? 'The request timed out. Please try again.'
              : err?.error?.message || 'Failed to update your profile. Please try again.';
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}

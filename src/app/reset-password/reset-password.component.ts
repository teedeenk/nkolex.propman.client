import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';
  confirmPassword = '';
  showNewPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.errorMessage = 'This password reset link is invalid or has expired.';
    }
  }

  onSubmit(): void {
    if (!this.token) {
      this.errorMessage = 'This password reset link is invalid or has expired.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;
    this.authService.resetPassword(this.token, this.newPassword, this.confirmPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Your password has been reset. You can now sign in.';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message ?? 'Unable to reset your password. Please request a new link.';
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
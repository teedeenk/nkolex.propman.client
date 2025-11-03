import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  showPassword = false;
  isLoading = false;
  returnUrl: string = '/dashboard';

  formData = {
    username: '',
    password: '',
    errorMessage: '',
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  onSubmit(): void {
    if (!this.formData.username || !this.formData.password) {
      this.formData.errorMessage = 'Please enter both username and password.';
      return;
    }

    this.formData.errorMessage = '';
    this.isLoading = true;

    this.authService
      .login(this.formData.username, this.formData.password)
      .subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error:', error);

          if (error.error?.message) {
            this.formData.errorMessage = error.error.message;
          } else if (error.status === 401 || error.status === 500) {
            this.formData.errorMessage = 'Invalid username or password';
          } else if (error.status === 0) {
            this.formData.errorMessage = 'Cannot connect to server';
          } else {
            this.formData.errorMessage = 'Login failed. Please try again.';
          }
        },
      });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}

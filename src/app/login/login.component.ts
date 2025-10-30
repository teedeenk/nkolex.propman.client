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
          this.router
            .navigate(['/dashboard'])
            .then((ok) => {
              console.log('navigate to /dashboard ok=', ok);
            })
            .catch((err) => console.error('navigate error', err));
        },
        error: (error) => {
          this.isLoading = false;
          this.formData.errorMessage =
            error.message?.message || 'Login failed. Please try again.';
          console.error('Login error:', error);
        },
      });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}

import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';

interface CreateAccountRequest {
  name: string;
  surname: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface CreateAccountResponse {
  success: boolean;
  message: string;
  userId?: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';
  registrationComplete = false;
  registeredEmail = '';

  formData: CreateAccountRequest = {
    name: '',
    surname: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  };

  private apiUrl = environment.apiUrl + '/account';

  constructor(
    private location: Location,
    private http: HttpClient,
    private router: Router
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    this.errorMessage = '';
    if (!this.validateForm()) {
      return;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    this.isLoading = true;
    this.http.post<CreateAccountResponse>(this.apiUrl, this.formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.registeredEmail = this.formData.email;
        this.registrationComplete = true;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred while creating the account.';
        console.error(error);
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private validateForm(): boolean {
    if (!this.formData.name.trim()) {
      this.errorMessage = 'Name is required';
      return false;
    }

    if (!this.formData.surname.trim()) {
      this.errorMessage = 'Surname is required';
      return false;
    }
    if (!this.formData.phoneNumber.trim()) {
      this.errorMessage = 'Phone number is required';
      return false;
    }
    if (!this.formData.email.trim()) {
      this.errorMessage = 'Email is required';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }

    if (!this.formData.password) {
      this.errorMessage = 'Password is required';
      return false;
    }

    if (this.formData.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return false;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }

    if (!this.formData.agreeToTerms) {
      this.errorMessage =
        'You must agree to the Terms of Service and Privacy Policy';
      return false;
    }

    return true;
  }

  goBack() {
    this.location.back();
  }
}

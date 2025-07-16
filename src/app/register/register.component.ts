import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  showPassword = false;
  showConfirmPassword = false;
  
  formData = {
    name: '',
    surname: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  };

  constructor(private location: Location) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.formData.password !== this.formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    console.log('Form submitted:', this.formData);
    alert('Account created successfully!');
  }

  goBack() {
    this.location.back();
  }
}
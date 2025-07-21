import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  showPassword = false;

  formData = {
    username: '',
    password: '',
  };

  constructor(private router: Router) {}
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  onSubmit() {}

  goBack() {
    this.router.navigate(['/']);
  }
}

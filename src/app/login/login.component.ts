import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

    showPassword = false;

    formData = {
    username: '',
    password: ''
  };

  constructor(private location: Location) {}
    togglePassword() {
    this.showPassword = !this.showPassword;
  }
    onSubmit() {
    }

  goBack() {
    this.location.back();
  }
}

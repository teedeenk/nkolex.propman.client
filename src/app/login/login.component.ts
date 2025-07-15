import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}

import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}


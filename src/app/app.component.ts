import { Component, OnInit } from '@angular/core';
import { Router,RouterOutlet } from '@angular/router';
import { WeatherService } from './services/weather.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'propman';
  weatherData: any[] = [];

  constructor(
    private weatherService: WeatherService,
    private router: Router
  ) {}

  ngOnInit() {
    this.weatherService.getweather().subscribe({
      next: data => {
        console.log('Weather data:', data);
        this.weatherData = data;
      },
      error: err => console.error('Failed to load weather data:', err)
    });
  }

    onCreateAccount() {
      console.log('Create account button clicked!');
      this.router.navigate(['/register']);
  }

  onSignIn() {
    console.log('Sign in button clicked!');
    this.router.navigate(['/login']);
  }
}



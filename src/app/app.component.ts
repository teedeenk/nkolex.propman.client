import { Component, OnInit } from '@angular/core';
import { Router,RouterOutlet, NavigationEnd } from '@angular/router';
import { WeatherService } from './services/weather.service';
import { filter } from 'rxjs/operators';

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
  showLandingContent = true;

  constructor(
    private weatherService: WeatherService,
    private router: Router
  ) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        this.showLandingContent = event.url === '/';
      });
  }

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



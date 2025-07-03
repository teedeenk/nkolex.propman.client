import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherService } from './services/weather.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'nkolex.propman.client';
  weatherData: any[] = [];

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    this.weatherService.getweather().subscribe({
      next: data => {
        console.log('Weather data:', data);
        this.weatherData = data;
      },
      error: err => console.error('Failed to load weather data:', err)
    });
  }
}



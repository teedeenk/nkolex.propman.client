import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'propman';
  weatherData: any[] = [];
  showLandingContent = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showLandingContent = event.url === '/';
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

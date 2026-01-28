import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'propman';
  weatherData: any[] = [];
  showLandingContent = true;

  constructor(
    private router: Router,
    private http: HttpClient,
  ) {
    this.router.events.subscribe((e) => console.log('[Router Event]', e));
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showLandingContent = event.url === '/';
      });
  }

  ngOnInit(): void {
    // Test if interceptor works with a simple request
    console.log('🧪 [AppComponent] Testing interceptor with a test request');
    this.http.get('https://jsonplaceholder.typicode.com/posts/1').subscribe({
      next: (data) => console.log('🧪 Test request successful:', data),
      error: (error) => console.error('🧪 Test request failed:', error),
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

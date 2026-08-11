import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterOutlet, RouterLink, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'propman';
  weatherData: any[] = [];
  showLandingContent = true;

  emailVerificationStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  emailVerificationMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.router.events.subscribe((e) => console.log('[Router Event]', e));
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url !== '/') {
          this.emailVerificationStatus = 'idle';
        }
        this.showLandingContent = event.url === '/' && this.emailVerificationStatus === 'idle';
      });
  }

  ngOnInit(): void {
    console.log('🧪 [AppComponent] Testing interceptor with a test request');
    this.http.get('https://jsonplaceholder.typicode.com/posts/1').subscribe({
      next: (data) => console.log('🧪 Test request successful:', data),
      error: (error) => console.error('🧪 Test request failed:', error),
    });

    this.route.queryParamMap.subscribe((params) => {
      const email = params.get('email');
      const token = params.get('token');
      if (email && token) {
        this.confirmEmail(email, token);
      }
    });
  }

  private confirmEmail(email: string, token: string): void {
    this.showLandingContent = false;
    this.emailVerificationStatus = 'loading';
    this.authService.confirmEmail(email, token).subscribe({
      next: () => {
        this.emailVerificationStatus = 'success';
        this.emailVerificationMessage = 'Your email has been verified. You can now log in.';
      },
      error: (error) => {
        console.error(error);
        this.emailVerificationStatus = 'error';
        this.emailVerificationMessage =
          'This verification link is invalid or has expired. Please request a new one.';
      },
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


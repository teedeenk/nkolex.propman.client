import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface LoginResponse {
  token: string;
  email: string;
  expiration: string;
  fullName: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<string | null>(
    this.getStoredFullName()
  );

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          this.setToken(response.token);
          this.setEmail(response.email);
          this.currentUserSubject.next(response.email);
          this.setFullName(response.fullName);
          this.currentUserSubject.next(response.fullName);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user_email');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const payLoad = JSON.parse(atob(token.split('.')[1]));
    return payLoad.exp > Date.now() / 1000;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setEmail(email: string): void {
    localStorage.setItem('user_email', email);
  }

  private setFullName(fullName: string): void {
    localStorage.setItem('user_fullname', fullName);
  }

  private getStoredFullName(): string | null {
    return localStorage.getItem('user_fullname');
  }

  private getStoredEmail(): string | null {
    return localStorage.getItem('user_email');
  }
}

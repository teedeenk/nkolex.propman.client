import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, tap, switchMap, map } from 'rxjs';

export interface LoginResponse {
  token: string;
  email: string;
  expiration: string;
  fullName: string;
}

export interface ProfileResponse {
  id: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<string | null>(
    this.getStoredFullName(),
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
          this.setFullName(response.fullName);
        }),
        switchMap((response) => this.loadProfile().pipe(map(() => response))),
        tap(() => {
          this.currentUserSubject.next(this.getStoredFullName());
        }),
      );
  }

  loadProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/auth/profile`).pipe(
      tap((profile) => {
        this.setUserId(profile.id ?? '');
        this.setRoles(profile.roles ?? []);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_roles');
    localStorage.removeItem('user_id');
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

  getRoles(): string[] {
    return this.getStoredRoles();
  }

  getUserId(): string {
    return localStorage.getItem('user_id') ?? '';
  }

  hasManagerAccess(): boolean {
    const roles = this.getRoles().map((r) => r.toLowerCase());
    return roles.includes('admin') || roles.includes('propertymanager');
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUserId(id: string): void {
    localStorage.setItem('user_id', id);
  }

  private setEmail(email: string): void {
    localStorage.setItem('user_email', email);
  }

  private setFullName(fullName: string): void {
    localStorage.setItem('user_fullname', fullName);
  }

  private setRoles(roles: string[]): void {
    localStorage.setItem('user_roles', JSON.stringify(roles));
  }

  private getStoredFullName(): string | null {
    return localStorage.getItem('user_fullname');
  }

  private getStoredEmail(): string | null {
    return localStorage.getItem('user_email');
  }

  private getStoredRoles(): string[] {
    const stored = localStorage.getItem('user_roles');
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

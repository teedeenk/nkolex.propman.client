import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private apiUrl = `${environment.apiUrl}/subscription`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  downgrade(): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/downgrade`, {})
      .pipe(switchMap(() => this.authService.loadProfile().pipe(map(() => undefined))));
  }
}

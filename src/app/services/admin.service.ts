import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SubscriptionTier } from './auth.service';

export const AVAILABLE_ROLES = ['Admin', 'PropertyManager', 'Tenant'] as const;

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  subscriptionTier: SubscriptionTier;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/admin/users`);
  }

  updateUserRoles(userId: string, roles: string[]): Observable<AdminUser> {
    return this.http.put<AdminUser>(
      `${this.apiUrl}/admin/users/${userId}/roles`,
      { roles },
    );
  }

  updateUserSubscription(
    userId: string,
    subscriptionTier: SubscriptionTier,
  ): Observable<AdminUser> {
    return this.http.put<AdminUser>(
      `${this.apiUrl}/admin/users/${userId}/subscription`,
      { subscriptionTier },
    );
  }
}

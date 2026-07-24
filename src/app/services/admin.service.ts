import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SubscriptionTier } from './auth.service';

export const AVAILABLE_ROLES = [
  'Admin',
  'PropertyManager',
  'Tenant',
  'Guest',
] as const;

// Mirrors the backend Account model (see IAccount).
export interface Account {
  id: string;
  name: string;
  surname: string;
  phoneNumber: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isDeleted: boolean;
  roles: string[];
  properties: string[] | null;
  subscriptionTier: SubscriptionTier;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/account/`);
  }

  updateAccount(account: Account): Observable<Account> {
    return this.http.put<Account>(`${this.apiUrl}/account/update`, account);
  }
}

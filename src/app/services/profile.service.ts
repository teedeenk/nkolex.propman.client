import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SubscriptionTier } from './auth.service';

export interface Profile {
  id: string;
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  roles: string[];
  subscriptionTier: SubscriptionTier;
}

export interface UpdateProfileRequest {
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfile(userId: string): Observable<Profile> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = { id: userId };
    return this.http.get<Profile>(`${this.apiUrl}/account/profile`, { headers, params });
  }

  updateProfile(userId: string, profile: UpdateProfileRequest): Observable<Profile> {
    const body = { id: userId, ...profile };
    return this.http.put<Profile>(`${this.apiUrl}/account/update-profile`, body);
  }
}

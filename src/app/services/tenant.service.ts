import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  status: 'active' | 'pending' | 'inactive';
  paymentStatus: 'current' | 'late' | 'overdue';
}

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTenants(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(`${this.apiUrl}/tenants`);
  }

  addTenant(tenant: Omit<Tenant, 'id'>): Observable<Tenant> {
    return this.http.post<Tenant>(`${this.apiUrl}/tenants`, tenant);
  }

  updateTenant(tenant: Tenant): Observable<Tenant> {
    return this.http.put<Tenant>(`${this.apiUrl}/tenants/${tenant.id}`, tenant);
  }

  deleteTenant(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tenants/${id}`);
  }
}

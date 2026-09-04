import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AccountSummary {
  id: string;
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  propertyType: string;
  statement: string;
  propertyManager: AccountSummary | null;
  tenants: AccountSummary[];
}

export interface CreatePropertyRequest {
  name: string;
  address: string;
  propertyType: string;
  propertyManager: string;
}

export interface UpdatePropertyRequest {
  id: string;
  name: string;
  address: string;
  propertyType: string;
  propertyManager: string;
}

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/property/properties`);
  }

  addProperty(property: CreatePropertyRequest): Observable<Property> {
    return this.http.post<Property>(
      `${this.apiUrl}/property/uploadproperty`,
      property,
    );
  }

  updateProperty(property: UpdatePropertyRequest): Observable<Property> {
    return this.http.put<Property>(
      `${this.apiUrl}/property/${property.id}`,
      property,
    );
  }

  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/property/${id}`);
  }
}

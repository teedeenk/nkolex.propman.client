import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Property {
  id: string;
  name: string;
  address: string;
  propertyManager: string;
  tenants: string[];
  statement: string;
  propertyType: string;
}

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/properties`);
  }

  addProperty(
    property: Omit<Property, 'id' | 'tenants' | 'statement'>,
  ): Observable<Property> {
    return this.http.post<Property>(
      `${this.apiUrl}/property/uploadproperty`,
      property,
    );
  }

  updateProperty(property: Property): Observable<Property> {
    return this.http.put<Property>(
      `${this.apiUrl}/properties/${property.id}`,
      property,
    );
  }

  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/properties/${id}`);
  }
}

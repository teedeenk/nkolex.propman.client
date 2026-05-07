import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Property {
  id: number;
  name: string;
  address: string;
  type: 'residential' | 'commercial' | 'mixed';
  units: number;
  purchasePrice: number;
  currentValue: number;
  monthlyIncome: number;
  status: 'active' | 'vacant' | 'maintenance';
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

  addProperty(property: Omit<Property, 'id'>): Observable<Property> {
    return this.http.post<Property>(`${this.apiUrl}/properties`, property);
  }

  updateProperty(property: Property): Observable<Property> {
    return this.http.put<Property>(
      `${this.apiUrl}/properties/${property.id}`,
      property,
    );
  }

  deleteProperty(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/properties/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PropertyService } from './property.service';

export interface Activity {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  draft: boolean;
  active: boolean;
  done: boolean;
  isDeleted: boolean;
  userId: string;
  propertyId: string;
}

export type CreateActivityRequest = Omit<Activity, 'id' | 'isDeleted'>;

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private apiUrl = `${environment.apiUrl}/activity`;

  constructor(
    private http: HttpClient,
    private propertyService: PropertyService,
  ) {}

  getActivitiesForProperty(propertyId: string): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}/activities/${propertyId}`);
  }

  // The API only returns activities per property, so aggregate across all of the user's properties.
  getActivities(): Observable<Activity[]> {
    return this.propertyService.getProperties().pipe(
      switchMap((properties) =>
        properties.length
          ? forkJoin(
              properties.map((property) =>
                this.getActivitiesForProperty(property.id),
              ),
            )
          : of([] as Activity[][]),
      ),
      map((results) => results.flat()),
    );
  }

  getActivity(id: string): Observable<Activity> {
    return this.http.get<Activity>(`${this.apiUrl}/${id}`);
  }

  createActivity(activity: CreateActivityRequest): Observable<Activity> {
    return this.http.post<Activity>(`${this.apiUrl}/createactivity`, activity);
  }

  updateActivity(activity: Activity): Observable<Activity> {
    return this.http.put<Activity>(`${this.apiUrl}/updateactivity`, activity);
  }

  deleteActivity(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

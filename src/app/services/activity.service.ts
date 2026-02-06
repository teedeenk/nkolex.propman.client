import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Activity {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'maintenance' | 'inspection' | 'meeting' | 'payment' | 'other';
  status: 'upcoming' | 'completed' | 'cancelled';
}

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private activities: Activity[] = [
    {
      id: 1,
      title: 'Electrician Visit',
      description: 'Fix electrical issues in Unit 3B',
      date: '2026-02-10',
      time: '10:00',
      type: 'maintenance',
      status: 'upcoming',
    },
    {
      id: 2,
      title: 'Property Inspection',
      description: 'Quarterly inspection of all units',
      date: '2026-02-15',
      time: '09:00',
      type: 'inspection',
      status: 'upcoming',
    },
    {
      id: 3,
      title: 'Plumbing Repair',
      description: 'Fixed leaking pipe in Unit 2A',
      date: '2026-01-28',
      time: '14:00',
      type: 'maintenance',
      status: 'completed',
    },
  ];

  private activitiesSubject = new BehaviorSubject<Activity[]>(this.activities);

  getActivities(): Observable<Activity[]> {
    return this.activitiesSubject.asObservable();
  }

  getActivitiesSync(): Activity[] {
    return [...this.activities];
  }

  getUpcomingActivities(): Activity[] {
    return this.activities
      .filter((activity) => activity.status === 'upcoming')
      .sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateA.getTime() - dateB.getTime();
      });
  }

  addActivity(activity: Activity): void {
    this.activities.push(activity);
    this.activitiesSubject.next([...this.activities]);
  }

  updateActivity(id: number, updates: Partial<Activity>): void {
    const index = this.activities.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.activities[index] = { ...this.activities[index], ...updates };
      this.activitiesSubject.next([...this.activities]);
    }
  }

  deleteActivity(id: number): void {
    this.activities = this.activities.filter((a) => a.id !== id);
    this.activitiesSubject.next([...this.activities]);
  }

  getNextId(): number {
    return Math.max(...this.activities.map((a) => a.id), 0) + 1;
  }
}

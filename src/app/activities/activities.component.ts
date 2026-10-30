import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  ActivityService,
  Activity,
  CreateActivityRequest,
} from '../services/activity.service';
import { AuthService } from '../services/auth.service';
import { PropertyService, Property } from '../services/property.service';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css'],
})
export class ActivitiesComponent implements OnInit {
  activities: Activity[] = [];
  filteredActivities: Activity[] = [];
  filterStatus: 'all' | 'draft' | 'upcoming' | 'completed' | 'cancelled' =
    'all';
  filterPropertyId = 'all';
  isAddingActivity: boolean = false;
  isLoading = false;
  errorMessage = '';
  properties: Property[] = [];

  newActivity!: CreateActivityRequest;

  constructor(
    private router: Router,
    private activityService: ActivityService,
    private authService: AuthService,
    private propertyService: PropertyService,
  ) {
    this.newActivity = this.emptyActivity();
  }

  ngOnInit(): void {
    this.loadActivities();
    this.loadProperties();
  }

  private emptyActivity(): CreateActivityRequest {
    return {
      name: '',
      description: '',
      date: '',
      time: '',
      draft: false,
      active: true,
      done: false,
      userId: this.authService.getUserId(),
      propertyId: '',
    };
  }

  private toErrorMessage(error: unknown, fallback: string): string {
    console.error(fallback, error);
    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }
    if (error.status === 0) {
      return 'Unable to reach the server. Please check your connection.';
    }
    if (error.status === 401 || error.status === 403) {
      return 'Your session has expired or you do not have access. Please sign in again.';
    }
    const body = error.error;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (body?.message) {
      return body.message;
    }
    if (body?.errors) {
      const messages = (Object.values(body.errors) as string[][]).flat();
      if (messages.length) {
        return messages.join(' ');
      }
    }
    return body?.title || fallback;
  }

  dismissError(): void {
    this.errorMessage = '';
  }

  private loadProperties(): void {
    this.propertyService.getProperties().subscribe({
      next: (properties) => {
        this.properties = properties;
      },
      error: (error) => {
        this.errorMessage = this.toErrorMessage(
          error,
          'Properties could not be loaded. Please try again.',
        );
      },
    });
  }

  private loadActivities(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.activityService.getActivities().subscribe({
      next: (activities) => {
        this.activities = activities.filter((activity) => !activity.isDeleted);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = this.toErrorMessage(
          error,
          'Activities could not be loaded. Please try again.',
        );
        this.isLoading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  applyFilters(): void {
    this.filteredActivities = this.activities.filter((activity) => {
      const statusMatch =
        this.filterStatus === 'all' ||
        this.getStatus(activity) === this.filterStatus;
      return (
        statusMatch &&
        (this.filterPropertyId === 'all' ||
          activity.propertyId === this.filterPropertyId)
      );
    });

    this.filteredActivities.sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateB.getTime() - dateA.getTime();
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  showAddActivityForm(): void {
    this.isAddingActivity = true;
    this.resetNewActivity();
  }

  hideAddActivityForm(): void {
    this.isAddingActivity = false;
    this.resetNewActivity();
  }

  resetNewActivity(): void {
    this.newActivity = this.emptyActivity();
  }

  addActivity(): void {
    if (
      !this.newActivity.name ||
      !this.newActivity.date ||
      !this.newActivity.time ||
      !this.newActivity.propertyId
    ) {
      alert('Please fill in all required fields');
      return;
    }

    const request: CreateActivityRequest = {
      ...this.newActivity,
      userId: this.authService.getUserId(),
    };

    this.activityService.createActivity(request).subscribe({
      next: (activity) => {
        this.activities.push(activity);
        this.applyFilters();
        this.hideAddActivityForm();
      },
      error: (error) => {
        this.errorMessage = this.toErrorMessage(
          error,
          'Activity could not be created. Please try again.',
        );
      },
    });
  }

  deleteActivity(id: string): void {
    if (confirm('Are you sure you want to delete this activity?')) {
      this.activityService.deleteActivity(id).subscribe({
        next: () => {
          this.activities = this.activities.filter((activity) => activity.id !== id);
          this.applyFilters();
        },
        error: (error) => {
          this.errorMessage = this.toErrorMessage(
            error,
            'Activity could not be deleted. Please try again.',
          );
        },
      });
    }
  }

  updateActivityStatus(
    id: string,
    status: 'upcoming' | 'completed' | 'cancelled',
  ): void {
    const activity = this.activities.find((item) => item.id === id);
    if (!activity) {
      return;
    }

    const updated: Activity = {
      ...activity,
      draft: false,
      active: status !== 'cancelled',
      done: status === 'completed',
    };

    this.activityService.updateActivity(updated).subscribe({
      next: (result) => {
        const index = this.activities.findIndex((item) => item.id === id);
        if (index !== -1) {
          this.activities[index] = result;
          this.applyFilters();
        }
      },
      error: (error) => {
        this.errorMessage = this.toErrorMessage(
          error,
          'Activity could not be updated. Please try again.',
        );
      },
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      maintenance: '🔧',
      inspection: '🔍',
      meeting: '👥',
      payment: '💰',
      other: '📋',
    };
    return icons[type] || '📋';
  }

  getStatus(
    activity: Activity,
  ): 'draft' | 'upcoming' | 'completed' | 'cancelled' {
    if (activity.draft) {
      return 'draft';
    }
    if (activity.done) {
      return 'completed';
    }
    return activity.active ? 'upcoming' : 'cancelled';
  }

  getStatusClass(activity: Activity): string {
    return this.getStatus(activity);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ActivityService, Activity } from '../services/activity.service';

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
  filterStatus: string = 'all';
  filterType: string = 'all';
  isAddingActivity: boolean = false;

  newActivity: Activity = {
    id: 0,
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'maintenance',
    status: 'upcoming',
  };

  constructor(
    private router: Router,
    private activityService: ActivityService,
  ) {}

  ngOnInit(): void {
    this.activityService.getActivities().subscribe((activities) => {
      this.activities = activities;
      this.applyFilters();
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  applyFilters(): void {
    this.filteredActivities = this.activities.filter((activity) => {
      const statusMatch =
        this.filterStatus === 'all' || activity.status === this.filterStatus;
      const typeMatch =
        this.filterType === 'all' || activity.type === this.filterType;
      return statusMatch && typeMatch;
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
    this.newActivity = {
      id: 0,
      title: '',
      description: '',
      date: '',
      time: '',
      type: 'maintenance',
      status: 'upcoming',
    };
  }

  addActivity(): void {
    if (
      !this.newActivity.title ||
      !this.newActivity.date ||
      !this.newActivity.time
    ) {
      alert('Please fill in all required fields');
      return;
    }

    const activity: Activity = {
      ...this.newActivity,
      id: this.activityService.getNextId(),
    };

    this.activityService.addActivity(activity);
    this.hideAddActivityForm();
  }

  deleteActivity(id: number): void {
    if (confirm('Are you sure you want to delete this activity?')) {
      this.activityService.deleteActivity(id);
    }
  }

  updateActivityStatus(
    id: number,
    status: 'upcoming' | 'completed' | 'cancelled',
  ): void {
    this.activityService.updateActivity(id, { status });
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

  getStatusClass(status: string): string {
    return status;
  }

  getTypeClass(type: string): string {
    return type;
  }
}

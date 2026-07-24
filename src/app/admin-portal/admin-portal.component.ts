import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  AdminService,
  AdminUser,
  AVAILABLE_ROLES,
} from '../services/admin.service';
import { SubscriptionTier } from '../services/auth.service';

@Component({
  selector: 'app-admin-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-portal.component.html',
  styleUrls: ['./admin-portal.component.css'],
})
export class AdminPortalComponent implements OnInit {
  readonly availableRoles = AVAILABLE_ROLES;
  readonly subscriptionTiers: SubscriptionTier[] = ['Free', 'Premium'];

  users: AdminUser[] = [];
  filteredUsers: AdminUser[] = [];
  searchQuery: string = '';

  isLoading: boolean = false;
  loadError: string | null = null;

  editingUser: AdminUser | null = null;
  editingRoles: string[] = [];
  editingSubscriptionTier: SubscriptionTier = 'Free';

  isSaving: boolean = false;
  saveError: string | null = null;
  saveSuccess: boolean = false;

  constructor(
    private router: Router,
    private adminService: AdminService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading = true;
    this.loadError = null;
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Failed to load users. Please try again.';
        this.isLoading = false;
      },
    });
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  private applyFilter(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredUsers = this.users.filter(
      (u) =>
        !query ||
        u.fullName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query),
    );
  }

  startEdit(user: AdminUser): void {
    this.editingUser = user;
    this.editingRoles = [...user.roles];
    this.editingSubscriptionTier = user.subscriptionTier;
    this.saveError = null;
    this.saveSuccess = false;
  }

  cancelEdit(): void {
    this.editingUser = null;
    this.editingRoles = [];
    this.saveError = null;
  }

  isRoleSelected(role: string): boolean {
    return this.editingRoles.includes(role);
  }

  toggleRole(role: string): void {
    if (this.isRoleSelected(role)) {
      this.editingRoles = this.editingRoles.filter((r) => r !== role);
    } else {
      this.editingRoles = [...this.editingRoles, role];
    }
  }

  onSubmitEdit(): void {
    if (!this.editingUser) return;

    if (this.editingRoles.length === 0) {
      this.saveError = 'At least one role must be assigned.';
      return;
    }

    this.isSaving = true;
    this.saveError = null;

    const userId = this.editingUser.id;

    forkJoin({
      user: this.adminService.updateUserRoles(userId, this.editingRoles),
      subscription: this.adminService.updateUserSubscription(
        userId,
        this.editingSubscriptionTier,
      ),
    }).subscribe({
      next: ({ subscription }) => {
        const idx = this.users.findIndex((u) => u.id === userId);
        if (idx !== -1) {
          this.users[idx] = {
            ...this.users[idx],
            roles: this.editingRoles,
            subscriptionTier: subscription.subscriptionTier,
          };
        }
        this.applyFilter();
        this.isSaving = false;
        this.saveSuccess = true;
        setTimeout(() => {
          this.editingUser = null;
          this.saveSuccess = false;
        }, 1200);
      },
      error: () => {
        this.isSaving = false;
        this.saveError = 'Failed to update user. Please try again.';
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}

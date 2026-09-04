import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { AdminService, Account, AVAILABLE_ROLES, UpdateAccountRequest } from '../services/admin.service';
import { SubscriptionTier } from '../services/auth.service';
import { PropertyService, Property } from '../services/property.service';

const REQUEST_TIMEOUT_MS = 15000;

@Component({
  selector: 'app-admin-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-portal.component.html',
  styleUrls: ['./admin-portal.component.css'],
})
export class AdminPortalComponent implements OnInit {
  @ViewChild('editCard') editCardRef?: ElementRef<HTMLElement>;

  readonly availableRoles = AVAILABLE_ROLES;
  readonly subscriptionTiers: SubscriptionTier[] = ['Free', 'Premium'];

  accounts: Account[] = [];
  filteredAccounts: Account[] = [];
  searchQuery: string = '';

  isLoading: boolean = false;
  loadError: string | null = null;

  properties: Property[] = [];

  editingAccount: Account | null = null;
  editingRoles: string[] = [];
  editingSubscriptionTier: SubscriptionTier = 'Free';
  editingPropertyIds: string[] = [];

  isSaving: boolean = false;
  saveError: string | null = null;
  saveSuccess: boolean = false;

  deletingAccountId: string | null = null;
  isDeleting: boolean = false;
  deleteError: string | null = null;
  showDeleteConfirm: boolean = false;
  accountToDelete: Account | null = null;

  constructor(
    private router: Router,
    private adminService: AdminService,
    private propertyService: PropertyService,
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadProperties();
  }

  private loadProperties(): void {
    this.propertyService.getProperties().subscribe({
      next: (data) => (this.properties = data),
    });
  }

  private loadAccounts(): void {
    this.isLoading = true;
    this.loadError = null;
    this.adminService
      .getAccounts()
      .pipe(
        timeout(REQUEST_TIMEOUT_MS),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => {
          this.accounts = data;
          this.applyFilter();
        },
        error: (err) => {
          this.loadError =
            err?.name === 'TimeoutError'
              ? 'The request timed out. Please try again.'
              : 'Failed to load users. Please try again.';
        },
      });
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  private applyFilter(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredAccounts = this.accounts.filter(
      (a) =>
        !query ||
        this.fullName(a).toLowerCase().includes(query) ||
        a.email.toLowerCase().includes(query),
    );
  }

  fullName(account: Account): string {
    return `${account.name} ${account.surname}`.trim();
  }

  private toPropertyId(entry: Property | string): string {
    return typeof entry === 'string' ? entry : entry.id;
  }

  startEdit(account: Account): void {
    this.editingAccount = account;
    this.editingRoles = [...account.roles];
    this.editingSubscriptionTier = account.subscriptionTier;
    this.editingPropertyIds = account.properties
      ? account.properties.map((p) => this.toPropertyId(p))
      : [];
    this.saveError = null;
    this.saveSuccess = false;

    setTimeout(() => {
      const el = this.editCardRef?.nativeElement;
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el?.focus();
    });
  }

  cancelEdit(): void {
    this.editingAccount = null;
    this.editingRoles = [];
    this.editingPropertyIds = [];
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

  isPropertyManager(): boolean {
    return this.isRoleSelected('PropertyManager');
  }

  isPropertySelected(propertyId: string): boolean {
    return this.editingPropertyIds.includes(propertyId);
  }

  toggleProperty(propertyId: string): void {
    if (this.isPropertySelected(propertyId)) {
      this.editingPropertyIds = this.editingPropertyIds.filter((id) => id !== propertyId);
    } else {
      this.editingPropertyIds = [...this.editingPropertyIds, propertyId];
    }
  }

  assignedPropertyCount(account: Account): number {
    return account.properties?.length ?? 0;
  }

  assignedProperties(): Property[] {
    return this.properties.filter((p) => this.isPropertySelected(p.id));
  }

  assignedPropertyNames(): string {
    return this.assignedProperties()
      .map((p) => p.name)
      .join(', ');
  }

  unassignedProperties(): Property[] {
    return this.properties.filter(
      (p) => !p.propertyManager && !this.isPropertySelected(p.id),
    );
  }

  otherManagerProperties(): Property[] {
    return this.properties.filter(
      (p) =>
        p.propertyManager &&
        p.propertyManager.id !== this.editingAccount?.id &&
        !this.isPropertySelected(p.id),
    );
  }

  onSubmitEdit(): void {
    if (!this.editingAccount) return;

    if (this.editingRoles.length === 0) {
      this.saveError = 'At least one role must be assigned.';
      return;
    }

    this.isSaving = true;
    this.saveError = null;

    const updatedAccount: UpdateAccountRequest = {
      ...this.editingAccount,
      roles: this.editingRoles,
      subscriptionTier: this.editingSubscriptionTier,
      properties: this.isPropertyManager() ? this.editingPropertyIds : [],
    };

    this.adminService
      .updateAccount(updatedAccount)
      .pipe(
        timeout(REQUEST_TIMEOUT_MS),
        finalize(() => (this.isSaving = false)),
      )
      .subscribe({
        next: (saved) => {
          const idx = this.accounts.findIndex((a) => a.id === saved.id);
          if (idx !== -1) this.accounts[idx] = saved;
          this.applyFilter();
          this.loadProperties();
          this.saveSuccess = true;
          setTimeout(() => {
            this.editingAccount = null;
            this.saveSuccess = false;
          }, 2000);
        },
        error: (err) => {
          this.saveError =
            err?.name === 'TimeoutError'
              ? 'The request timed out. Please try again.'
              : 'Failed to update user. Please try again.';
        },
      });
  }

  confirmDelete(account: Account): void {
    this.accountToDelete = account;
    this.showDeleteConfirm = true;
    this.deleteError = null;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.accountToDelete = null;
    this.deleteError = null;
  }

  deleteUser(): void {
    if (!this.accountToDelete) return;

    this.isDeleting = true;
    this.deleteError = null;
    this.deletingAccountId = this.accountToDelete.id;

    this.adminService
      .deleteAccount(this.accountToDelete)
      .pipe(
        timeout(REQUEST_TIMEOUT_MS),
        finalize(() => {
          this.isDeleting = false;
          this.deletingAccountId = null;
        }),
      )
      .subscribe({
        next: () => {
          this.accounts = this.accounts.filter((a) => a.id !== this.accountToDelete!.id);
          this.applyFilter();
          
          if (this.editingAccount?.id === this.accountToDelete!.id) {
            this.editingAccount = null;
          }
          
          this.showDeleteConfirm = false;
          this.accountToDelete = null;
        },
        error: (err) => {
          this.deleteError =
            err?.name === 'TimeoutError'
              ? 'The request timed out. Please try again.'
              : err?.error?.message || 'Failed to delete user. Please try again.';
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}

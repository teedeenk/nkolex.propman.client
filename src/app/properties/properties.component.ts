import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  PropertyService,
  Property,
  CreatePropertyRequest,
  UpdatePropertyRequest,
} from '../services/property.service';
import { AuthService } from '../services/auth.service';
import {
  AdminService,
  Account,
  UpdateAccountRequest,
} from '../services/admin.service';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.css'],
})
export class PropertiesComponent implements OnInit {
  properties: Property[] = [];
  filteredProperties: Property[] = [];

  filterStatus: string = 'all';
  searchQuery: string = '';

  isAddingProperty: boolean = false;
  isEditingProperty: boolean = false;

  isLoading: boolean = false;
  isSaving: boolean = false;
  saveError: string | null = null;
  saveSuccess: boolean = false;

  newProperty: CreatePropertyRequest = this.emptyPropertyForm();

  editingProperty: Property | null = null;
  editingPropertyManagerId: string = '';

  allAccounts: Account[] = [];
  assigningProperty: Property | null = null;
  tenantSearchQuery: string = '';
  isLoadingAccounts: boolean = false;
  isSavingTenantAssignment: boolean = false;
  assignError: string | null = null;

  constructor(
    private router: Router,
    private propertyService: PropertyService,
    private authService: AuthService,
    private adminService: AdminService,
  ) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  private loadProperties(): void {
    this.isLoading = true;
    this.propertyService.getProperties().subscribe({
      next: (data) => {
        this.properties = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private emptyPropertyForm(): CreatePropertyRequest {
    return {
      name: '',
      address: '',
      propertyType: '',
      propertyManager: '',
    };
  }

  managerFullName(property: Property): string {
    return property.propertyManager
      ? `${property.propertyManager.name} ${property.propertyManager.surname}`.trim()
      : '';
  }

  propertyManagerAccounts(): Account[] {
    return this.allAccounts.filter((a) =>
      a.roles.some((r) => r.toLowerCase() === 'propertymanager'),
    );
  }

  editingPropertyManagerName(): string {
    // Unchanged selection: use the name already loaded with the property, no accounts fetch needed.
    if (
      this.editingProperty &&
      this.editingPropertyManagerId ===
        (this.editingProperty.propertyManager?.id ?? '')
    ) {
      return this.managerFullName(this.editingProperty);
    }
    const account = this.allAccounts.find(
      (a) => a.id === this.editingPropertyManagerId,
    );
    return account ? `${account.name} ${account.surname}`.trim() : '';
  }

  applyFilters(): void {
    this.filteredProperties = this.properties.filter((p) => {
      const matchesSearch =
        !this.searchQuery ||
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        this.managerFullName(p)
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
      return matchesSearch;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  showAddForm(): void {
    this.newProperty = this.emptyPropertyForm();
    this.saveError = null;
    this.saveSuccess = false;
    this.isAddingProperty = true;
    this.isEditingProperty = false;
  }

  hideAddForm(): void {
    this.isAddingProperty = false;
    this.saveError = null;
  }

  onSubmitAdd(): void {
    if (!this.newProperty.name || !this.newProperty.address) {
      this.saveError = 'Property name and address are required.';
      return;
    }

    this.saveError = null;

    const userId = this.authService.getUserId();
    if (userId) {
      this.submitNewProperty(userId);
      return;
    }

    this.isSaving = true;
    this.authService.loadProfile().subscribe({
      next: (profile) => {
        if (profile.userId) {
          this.submitNewProperty(profile.userId);
        } else {
          console.error('loadProfile() returned no id:', profile);
          this.isSaving = false;
          this.saveError =
            'Unable to determine property manager. Please log in again.';
        }
      },
      error: (err) => {
        console.error('loadProfile() failed:', err);
        this.isSaving = false;
        this.saveError =
          'Unable to determine property manager. Please log in again.';
      },
    });
  }

  private submitNewProperty(propertyManagerId: string): void {
    this.newProperty.propertyManager = propertyManagerId;
    this.isSaving = true;
    this.saveError = null;

    this.propertyService.addProperty(this.newProperty).subscribe({
      next: (created) => {
        this.properties.push(created);
        this.applyFilters();
        this.isSaving = false;
        this.saveSuccess = true;
        setTimeout(() => {
          this.isAddingProperty = false;
          this.saveSuccess = false;
        }, 1500);
      },
      error: () => {
        this.isSaving = false;
        this.saveError = 'Failed to save property. Please try again.';
      },
    });
  }

  startEdit(property: Property): void {
    this.editingProperty = { ...property };
    this.editingPropertyManagerId = property.propertyManager?.id ?? '';
    this.saveError = null;
    this.saveSuccess = false;
    this.isEditingProperty = true;
    this.isAddingProperty = false;
    this.beginTenantManagement(property);
  }

  cancelEdit(): void {
    this.isEditingProperty = false;
    this.editingProperty = null;
    this.editingPropertyManagerId = '';
    this.saveError = null;
    this.closeAssignTenants();
  }

  onSubmitEdit(): void {
    if (!this.editingProperty) return;
    if (
      !this.editingProperty.name ||
      !this.editingProperty.address ||
      !this.editingPropertyManagerId
    ) {
      this.saveError = 'Property name, address and manager are required.';
      return;
    }

    this.isSaving = true;
    this.saveError = null;

    const request: UpdatePropertyRequest = {
      id: this.editingProperty.id,
      name: this.editingProperty.name,
      address: this.editingProperty.address,
      propertyType: this.editingProperty.propertyType,
      propertyManager: this.editingPropertyManagerId,
    };

    this.propertyService.updateProperty(request).subscribe({
      next: (updated) => {
        const idx = this.properties.findIndex((p) => p.id === updated.id);
        if (idx !== -1) this.properties[idx] = updated;
        this.applyFilters();
        this.isSaving = false;
        this.saveSuccess = true;
        setTimeout(() => {
          this.isEditingProperty = false;
          this.editingProperty = null;
          this.saveSuccess = false;
          this.closeAssignTenants();
        }, 1500);
      },
      error: () => {
        this.isSaving = false;
        this.saveError = 'Failed to update property. Please try again.';
      },
    });
  }

  deleteProperty(property: Property): void {
    if (!confirm(`Delete "${property.name}"? This cannot be undone.`)) return;

    this.propertyService.deleteProperty(property.id).subscribe({
      next: () => {
        this.properties = this.properties.filter((p) => p.id !== property.id);
        this.applyFilters();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  private toPropertyId(entry: Property | string): string {
    return typeof entry === 'string' ? entry : entry.id;
  }

  openAssignTenants(property: Property): void {
    this.isEditingProperty = false;
    this.isAddingProperty = false;
    this.beginTenantManagement(property);
  }

  private beginTenantManagement(property: Property): void {
    this.assigningProperty = property;
    this.tenantSearchQuery = '';
    this.assignError = null;
    this.loadAccounts();
  }

  closeAssignTenants(): void {
    this.assigningProperty = null;
    this.assignError = null;
  }

  private loadAccounts(): void {
    this.isLoadingAccounts = true;
    this.adminService.getAccounts().subscribe({
      next: (data) => {
        this.allAccounts = data;
        this.isLoadingAccounts = false;
      },
      error: () => {
        this.isLoadingAccounts = false;
        this.assignError = 'Failed to load tenant accounts. Please try again.';
      },
    });
  }

  tenantAccounts(): Account[] {
    const query = this.tenantSearchQuery.trim().toLowerCase();
    return this.allAccounts
      .filter((a) => a.roles.some((r) => r.toLowerCase() === 'tenant'))
      .filter(
        (a) =>
          !query ||
          `${a.name} ${a.surname}`.toLowerCase().includes(query) ||
          a.email.toLowerCase().includes(query),
      );
  }

  isTenantAssigned(account: Account): boolean {
    return !!this.assigningProperty?.tenants.some((t) => t.id === account.id);
  }

  toggleTenantAssignment(account: Account): void {
    if (!this.assigningProperty || this.isSavingTenantAssignment) return;

    const propertyId = this.assigningProperty.id;
    const currentIds = (account.properties ?? []).map((p) =>
      this.toPropertyId(p),
    );
    const isAssigned = currentIds.includes(propertyId);
    const updatedIds = isAssigned
      ? currentIds.filter((id) => id !== propertyId)
      : [...currentIds, propertyId];

    const request: UpdateAccountRequest = {
      ...account,
      properties: updatedIds,
    };

    this.isSavingTenantAssignment = true;
    this.assignError = null;

    this.adminService.updateAccount(request).subscribe({
      next: (saved) => {
        const savedAccount: Account = saved ?? { ...account, properties: updatedIds };
        const idx = this.allAccounts.findIndex((a) => a.id === savedAccount.id);
        if (idx !== -1) this.allAccounts[idx] = savedAccount;
        this.reloadPropertiesKeepingAssignOpen(propertyId);
        this.isSavingTenantAssignment = false;
      },
      error: () => {
        this.isSavingTenantAssignment = false;
        this.assignError = 'Failed to update tenant assignment. Please try again.';
      },
    });
  }

  private reloadPropertiesKeepingAssignOpen(propertyId: string): void {
    this.propertyService.getProperties().subscribe({
      next: (data) => {
        this.properties = data;
        this.applyFilters();
        this.assigningProperty =
          this.properties.find((p) => p.id === propertyId) ?? null;
      },
    });
  }
}

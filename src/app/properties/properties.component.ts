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

  constructor(
    private router: Router,
    private propertyService: PropertyService,
    private authService: AuthService,
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
  }

  cancelEdit(): void {
    this.isEditingProperty = false;
    this.editingProperty = null;
    this.editingPropertyManagerId = '';
    this.saveError = null;
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
}

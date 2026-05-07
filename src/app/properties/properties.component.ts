import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService, Property } from '../services/property.service';

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
  filterType: string = 'all';
  searchQuery: string = '';

  isAddingProperty: boolean = false;
  isEditingProperty: boolean = false;

  isLoading: boolean = false;
  isSaving: boolean = false;
  saveError: string | null = null;
  saveSuccess: boolean = false;

  newProperty: Omit<Property, 'id'> = this.emptyPropertyForm();

  editingProperty: Property | null = null;

  constructor(
    private router: Router,
    private propertyService: PropertyService,
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

  private emptyPropertyForm(): Omit<Property, 'id'> {
    return {
      name: '',
      address: '',
      type: 'residential',
      units: 1,
      purchasePrice: 0,
      currentValue: 0,
      monthlyIncome: 0,
      status: 'active',
    };
  }

  applyFilters(): void {
    this.filteredProperties = this.properties.filter((p) => {
      const matchesStatus =
        this.filterStatus === 'all' || p.status === this.filterStatus;
      const matchesType =
        this.filterType === 'all' || p.type === this.filterType;
      const matchesSearch =
        !this.searchQuery ||
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
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
    this.saveError = null;
    this.saveSuccess = false;
    this.isEditingProperty = true;
    this.isAddingProperty = false;
  }

  cancelEdit(): void {
    this.isEditingProperty = false;
    this.editingProperty = null;
    this.saveError = null;
  }

  onSubmitEdit(): void {
    if (!this.editingProperty) return;
    if (!this.editingProperty.name || !this.editingProperty.address) {
      this.saveError = 'Property name and address are required.';
      return;
    }

    this.isSaving = true;
    this.saveError = null;

    this.propertyService.updateProperty(this.editingProperty).subscribe({
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getTypeLabel(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}

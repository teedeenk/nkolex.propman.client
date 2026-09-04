import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TenantService, Tenant } from '../services/tenant.service';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenants.component.html',
  styleUrls: ['./tenants.component.css'],
})
export class TenantsComponent implements OnInit {
  tenants: Tenant[] = [];

  filteredTenants: Tenant[] = [];
  isLoading: boolean = false;
  filterStatus: string = 'all';
  searchQuery: string = '';
  isAddingTenant: boolean = false;
  isEditingTenant: boolean = false;
  viewMode: 'cards' | 'table' = 'cards';

  newTenant: Omit<Tenant, 'id'> = {
    name: '',
    email: '',
    phone: '',
    unit: '',
    leaseStart: '',
    leaseEnd: '',
    rentAmount: 0,
    status: 'active',
    paymentStatus: 'current',
  };

  editingTenant: Tenant = {
    id: '',
    name: '',
    email: '',
    phone: '',
    unit: '',
    leaseStart: '',
    leaseEnd: '',
    rentAmount: 0,
    status: 'active',
    paymentStatus: 'current',
  };

  constructor(
    private router: Router,
    private tenantService: TenantService,
  ) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  private loadTenants(): void {
    this.isLoading = true;
    this.tenantService.getTenants().subscribe({
      next: (data) => {
        this.tenants = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  applyFilters(): void {
    this.filteredTenants = this.tenants.filter((tenant) => {
      const statusMatch =
        this.filterStatus === 'all' || tenant.status === this.filterStatus;
      const searchMatch =
        !this.searchQuery ||
        tenant.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        tenant.unit.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        tenant.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      return statusMatch && searchMatch;
    });

    this.filteredTenants.sort((a, b) => a.name.localeCompare(b.name));
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  toggleViewMode(mode: 'cards' | 'table'): void {
    this.viewMode = mode;
  }

  openInvoices(): void {
    this.router.navigate(['/invoices']);
  }

  showAddTenantForm(): void {
    this.isAddingTenant = true;
    this.isEditingTenant = false;
    this.resetNewTenant();
  }

  hideAddTenantForm(): void {
    this.isAddingTenant = false;
    this.resetNewTenant();
  }

  resetNewTenant(): void {
    this.newTenant = {
      name: '',
      email: '',
      phone: '',
      unit: '',
      leaseStart: '',
      leaseEnd: '',
      rentAmount: 0,
      status: 'active',
      paymentStatus: 'current',
    };
  }

  addTenant(): void {
    if (
      !this.newTenant.name ||
      !this.newTenant.email ||
      !this.newTenant.unit ||
      !this.newTenant.leaseStart
    ) {
      alert('Please fill in all required fields');
      return;
    }

    this.tenantService.addTenant(this.newTenant).subscribe({
      next: (created) => {
        this.tenants.push(created);
        this.applyFilters();
        this.hideAddTenantForm();
      },
    });
  }

  editTenant(id: string): void {
    const tenant = this.tenants.find((t) => t.id === id);
    if (tenant) {
      this.editingTenant = { ...tenant };
      this.isEditingTenant = true;
      this.isAddingTenant = false;
    }
  }

  updateTenant(): void {
    if (
      !this.editingTenant.name ||
      !this.editingTenant.email ||
      !this.editingTenant.unit ||
      !this.editingTenant.leaseStart
    ) {
      alert('Please fill in all required fields');
      return;
    }

    this.tenantService.updateTenant(this.editingTenant).subscribe({
      next: (updated) => {
        const index = this.tenants.findIndex((t) => t.id === updated.id);
        if (index !== -1) this.tenants[index] = updated;
        this.applyFilters();
        this.cancelEdit();
      },
    });
  }

  cancelEdit(): void {
    this.isEditingTenant = false;
    this.editingTenant = {
      id: '',
      name: '',
      email: '',
      phone: '',
      unit: '',
      leaseStart: '',
      leaseEnd: '',
      rentAmount: 0,
      status: 'active',
      paymentStatus: 'current',
    };
  }

  deleteTenant(id: string): void {
    if (confirm('Are you sure you want to remove this tenant?')) {
      this.tenantService.deleteTenant(id).subscribe({
        next: () => {
          this.tenants = this.tenants.filter((t) => t.id !== id);
          this.applyFilters();
        },
      });
    }
  }

  updateTenantStatus(
    id: string,
    status: 'active' | 'pending' | 'inactive',
  ): void {
    const tenant = this.tenants.find((t) => t.id === id);
    if (!tenant) return;

    const updated: Tenant = { ...tenant, status };
    this.tenantService.updateTenant(updated).subscribe({
      next: (result) => {
        const index = this.tenants.findIndex((t) => t.id === id);
        if (index !== -1) this.tenants[index] = result;
        this.applyFilters();
      },
    });
  }

  formatCurrency(amount: number): string {
    return (
      'R ' +
      amount.toLocaleString('en-ZA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getDaysUntilLeaseEnd(leaseEnd: string): number {
    const today = new Date();
    const endDate = new Date(leaseEnd);
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getStatusClass(status: string): string {
    return status;
  }

  getPaymentStatusClass(status: string): string {
    return status;
  }
}

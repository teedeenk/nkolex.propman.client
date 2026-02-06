import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  unit: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  status: 'active' | 'pending' | 'inactive';
  paymentStatus: 'current' | 'late' | 'overdue';
}

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenants.component.html',
  styleUrls: ['./tenants.component.css'],
})
export class TenantsComponent implements OnInit {
  tenants: Tenant[] = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      unit: 'Unit 3B',
      leaseStart: '2025-01-01',
      leaseEnd: '2026-01-01',
      rentAmount: 1500,
      status: 'active',
      paymentStatus: 'current',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '(555) 234-5678',
      unit: 'Unit 2A',
      leaseStart: '2025-06-01',
      leaseEnd: '2026-06-01',
      rentAmount: 1800,
      status: 'active',
      paymentStatus: 'late',
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'mbrown@email.com',
      phone: '(555) 345-6789',
      unit: 'Unit 1C',
      leaseStart: '2024-09-01',
      leaseEnd: '2025-09-01',
      rentAmount: 1650,
      status: 'pending',
      paymentStatus: 'current',
    },
  ];

  filteredTenants: Tenant[] = [];
  filterStatus: string = 'all';
  searchQuery: string = '';
  isAddingTenant: boolean = false;
  isEditingTenant: boolean = false;
  viewMode: 'cards' | 'table' = 'cards';

  newTenant: Tenant = {
    id: 0,
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
    id: 0,
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.applyFilters();
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

    // Sort by name
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
      id: 0,
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

    const tenant: Tenant = {
      ...this.newTenant,
      id: Math.max(...this.tenants.map((t) => t.id), 0) + 1,
    };

    this.tenants.push(tenant);
    this.applyFilters();
    this.hideAddTenantForm();
  }

  editTenant(id: number): void {
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

    const index = this.tenants.findIndex((t) => t.id === this.editingTenant.id);
    if (index !== -1) {
      this.tenants[index] = { ...this.editingTenant };
      this.applyFilters();
      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    this.isEditingTenant = false;
    this.editingTenant = {
      id: 0,
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

  deleteTenant(id: number): void {
    if (confirm('Are you sure you want to remove this tenant?')) {
      this.tenants = this.tenants.filter((t) => t.id !== id);
      this.applyFilters();
    }
  }

  updateTenantStatus(
    id: number,
    status: 'active' | 'pending' | 'inactive',
  ): void {
    const tenant = this.tenants.find((t) => t.id === id);
    if (tenant) {
      tenant.status = status;
      this.applyFilters();
    }
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

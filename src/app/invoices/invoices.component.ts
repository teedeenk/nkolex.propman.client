import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../services/invoice.service';

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
  selected?: boolean;
  invoiceStatus?: 'sent' | '';
}

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css'],
})
export class InvoicesComponent implements OnInit {
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
      selected: false,
      invoiceStatus: '',
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
      selected: false,
      invoiceStatus: '',
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
      selected: false,
      invoiceStatus: '',
    },
  ];

  selectAll: boolean = false;
  isSending: boolean = false;
  showPreview: boolean = false;
  downloadPdfs: boolean = false;
  previewTenants: Tenant[] = [];

  constructor(private router: Router, private invoiceService: InvoiceService) {}

  ngOnInit(): void {}

  goBack(): void {
    this.router.navigate(['/tenants']);
  }

  toggleSelectAll(): void {
    this.tenants.forEach((tenant) => {
      if (tenant.status === 'active') {
        tenant.selected = this.selectAll;
      }
    });
  }

  onTenantSelectionChange(): void {
    const activeTenants = this.tenants.filter((t) => t.status === 'active');
    this.selectAll = activeTenants.every((t) => t.selected);
  }

  getSelectedTenants(): Tenant[] {
    return this.tenants.filter((t) => t.selected);
  }

  openPreview(): void {
    const selectedTenants = this.getSelectedTenants();
    
    if (selectedTenants.length === 0) {
      alert('Please select at least one tenant to invoice');
      return;
    }

    this.previewTenants = selectedTenants;
    this.showPreview = true;
    this.downloadPdfs = false;
  }

  closePreview(): void {
    this.showPreview = false;
    this.previewTenants = [];
    this.downloadPdfs = false;
  }

  confirmSend(): void {
    if (this.previewTenants.length === 0) {
      return;
    }

    this.isSending = true;

    if (this.downloadPdfs) {
      this.invoiceService.generateMultipleInvoices(this.previewTenants);
    }

    setTimeout(() => {
      this.isSending = false;
      
      this.previewTenants.forEach((tenant) => {
        tenant.invoiceStatus = 'sent';
      });
      
      const message = this.downloadPdfs 
        ? `Invoices sent successfully to ${this.previewTenants.length} tenant(s)!\n\nPDFs have been saved to your downloads folder.\n\nTenants:\n${this.previewTenants.map((t) => `${t.name} - ${t.email}`).join('\n')}`
        : `Invoices sent successfully to ${this.previewTenants.length} tenant(s)!\n\nTenants:\n${this.previewTenants.map((t) => `${t.name} - ${t.email}`).join('\n')}`;
      
      alert(message);
      
      this.tenants.forEach((t) => (t.selected = false));
      this.selectAll = false;
      this.closePreview();
    }, 1500);
  }

  formatCurrency(amount: number): string {
    return 'R ' + amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getStatusClass(status: string): string {
    return status;
  }

  getPaymentStatusClass(status: string): string {
    return status;
  }
}

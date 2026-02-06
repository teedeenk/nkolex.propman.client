import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  unit: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  status: string;
  paymentStatus: string;
}

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  constructor() {}

  generateInvoice(tenant: Tenant): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const invoiceDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days payment term
    const invoiceNumber = `INV-${invoiceDate.getFullYear()}${(invoiceDate.getMonth() + 1).toString().padStart(2, '0')}${tenant.id.toString().padStart(4, '0')}`;

    // Header - Company Info
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('NKOLEX PROPERTY', 15, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Property Management Services', 15, 28);
    doc.text('info@nkolex.com | +27 (123) 456-7890', 15, 34);

    // Invoice Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - 15, 55, { align: 'right' });

    // Invoice Details Box
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${invoiceNumber}`, pageWidth - 15, 65, { align: 'right' });
    doc.text(`Date: ${this.formatDate(invoiceDate)}`, pageWidth - 15, 72, { align: 'right' });
    doc.text(`Due Date: ${this.formatDate(dueDate)}`, pageWidth - 15, 79, { align: 'right' });

    // Bill To Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 15, 65);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(tenant.name, 15, 73);
    doc.text(`Unit: ${tenant.unit}`, 15, 80);
    doc.text(tenant.email, 15, 87);
    doc.text(tenant.phone || 'N/A', 15, 94);

    // Table Header
    const tableTop = 110;
    doc.setFillColor(102, 126, 234);
    doc.rect(15, tableTop, pageWidth - 30, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 20, tableTop + 7);
    doc.text('Amount', pageWidth - 20, tableTop + 7, { align: 'right' });

    // Table Content
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    const rowTop = tableTop + 18;
    
    doc.text(`Monthly Rent - ${tenant.unit}`, 20, rowTop);
    doc.text(`R ${tenant.rentAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 20, rowTop, { align: 'right' });
    
    doc.text(`Lease Period: ${this.formatDate(new Date(tenant.leaseStart))} - ${this.formatDate(new Date(tenant.leaseEnd))}`, 20, rowTop + 7);

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(15, rowTop + 15, pageWidth - 15, rowTop + 15);

    // Subtotal
    const subtotalTop = rowTop + 23;
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', pageWidth - 70, subtotalTop);
    doc.text(`R ${tenant.rentAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 20, subtotalTop, { align: 'right' });

    // VAT (15%)
    const vat = tenant.rentAmount * 0.15;
    doc.text('VAT (15%):', pageWidth - 70, subtotalTop + 7);
    doc.text(`R ${vat.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 20, subtotalTop + 7, { align: 'right' });

    // Total
    const total = tenant.rentAmount + vat;
    doc.setFillColor(240, 240, 240);
    doc.rect(pageWidth - 85, subtotalTop + 12, 70, 10, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', pageWidth - 70, subtotalTop + 19);
    doc.text(`R ${total.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 20, subtotalTop + 19, { align: 'right' });

    // Payment Instructions
    const paymentTop = subtotalTop + 40;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT DETAILS:', 15, paymentTop);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Bank: First National Bank', 15, paymentTop + 8);
    doc.text('Account Name: Nkolex Property Management', 15, paymentTop + 14);
    doc.text('Account Number: 62 1234 5678 90', 15, paymentTop + 20);
    doc.text('Branch Code: 250655', 15, paymentTop + 26);
    doc.text(`Reference: ${invoiceNumber}`, 15, paymentTop + 32);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for your business!', pageWidth / 2, 270, { align: 'center' });
    doc.text('For any queries, please contact us at info@nkolex.com', pageWidth / 2, 276, { align: 'center' });

    return doc;
  }

  generateAndDownloadInvoice(tenant: Tenant): void {
    const doc = this.generateInvoice(tenant);
    const fileName = `Invoice_${tenant.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  }

  generateMultipleInvoices(tenants: Tenant[]): void {
    tenants.forEach((tenant, index) => {
      setTimeout(() => {
        this.generateAndDownloadInvoice(tenant);
      }, index * 500); // Stagger downloads by 500ms to avoid browser blocking
    });
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

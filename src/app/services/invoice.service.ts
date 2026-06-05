import { Injectable } from '@angular/core';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

const pdfMakeModule = () => import('pdfmake/build/pdfmake');
const pdfFontsModule = () => import('pdfmake/build/vfs_fonts');

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

  generateInvoice(tenant: Tenant): TDocumentDefinitions {
    const invoiceDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const invoiceNumber = `INV-${invoiceDate.getFullYear()}${(invoiceDate.getMonth() + 1).toString().padStart(2, '0')}${tenant.id.toString().padStart(4, '0')}`;
    const vat = tenant.rentAmount * 0.15;
    const total = tenant.rentAmount + vat;

    const documentDefinition: TDocumentDefinitions = {
      content: [
        {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: 0,
              w: 515,
              h: 60,
              color: '#667eea',
            },
          ],
          absolutePosition: { x: 40, y: 40 },
        },
        {
          text: 'NKOLEX PROPERTY',
          style: 'header',
          color: 'white',
          absolutePosition: { x: 55, y: 55 },
        },
        {
          text: 'Property Management Services',
          fontSize: 10,
          color: 'white',
          absolutePosition: { x: 55, y: 75 },
        },
        {
          text: 'info@nkolex.com | +27 (123) 456-7890',
          fontSize: 9,
          color: 'white',
          absolutePosition: { x: 55, y: 87 },
        },

        {
          columns: [
            {
              width: '*',
              text: '',
            },
            {
              width: 'auto',
              stack: [
                { text: 'INVOICE', style: 'invoiceTitle', alignment: 'right' },
                {
                  text: [{ text: 'Invoice #: ', bold: true }, invoiceNumber],
                  fontSize: 10,
                  alignment: 'right',
                  margin: [0, 5, 0, 2],
                },
                {
                  text: [
                    { text: 'Date: ', bold: true },
                    this.formatDate(invoiceDate),
                  ],
                  fontSize: 10,
                  alignment: 'right',
                  margin: [0, 0, 0, 2],
                },
                {
                  text: [
                    { text: 'Due Date: ', bold: true },
                    this.formatDate(dueDate),
                  ],
                  fontSize: 10,
                  alignment: 'right',
                },
              ],
            },
          ],
          margin: [0, 30, 0, 20],
        },

        {
          text: 'BILL TO:',
          style: 'subheader',
          margin: [0, 0, 0, 5],
        },
        {
          text: tenant.name,
          bold: true,
          fontSize: 11,
          margin: [0, 0, 0, 3],
        },
        {
          text: `Unit: ${tenant.unit}`,
          fontSize: 10,
          margin: [0, 0, 0, 2],
        },
        {
          text: tenant.email,
          fontSize: 10,
          margin: [0, 0, 0, 2],
        },
        {
          text: tenant.phone || 'N/A',
          fontSize: 10,
          margin: [0, 0, 0, 20],
        },

        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'Description', style: 'tableHeader' },
                { text: 'Amount', style: 'tableHeader', alignment: 'right' },
              ],
              [
                {
                  stack: [
                    { text: `Monthly Rent - ${tenant.unit}`, bold: true },
                    {
                      text: `Lease Period: ${this.formatDate(new Date(tenant.leaseStart))} - ${this.formatDate(new Date(tenant.leaseEnd))}`,
                      fontSize: 9,
                      color: '#666',
                      margin: [0, 3, 0, 0],
                    },
                  ],
                },
                {
                  text: this.formatCurrency(tenant.rentAmount),
                  alignment: 'right',
                  fontSize: 11,
                },
              ],
            ],
          },
          layout: {
            fillColor: function (rowIndex: number) {
              return rowIndex === 0 ? '#667eea' : null;
            },
            hLineWidth: function (i: number, node: any) {
              return i === 0 || i === node.table.body.length ? 0 : 1;
            },
            vLineWidth: function () {
              return 0;
            },
            hLineColor: function () {
              return '#e2e8f0';
            },
          },
        },

        {
          columns: [
            { width: '*', text: '' },
            {
              width: 200,
              stack: [
                {
                  columns: [
                    { text: 'Subtotal:', fontSize: 10 },
                    {
                      text: this.formatCurrency(tenant.rentAmount),
                      alignment: 'right',
                      fontSize: 10,
                    },
                  ],
                  margin: [0, 10, 0, 5],
                },
                {
                  columns: [
                    { text: 'VAT (15%):', fontSize: 10 },
                    {
                      text: this.formatCurrency(vat),
                      alignment: 'right',
                      fontSize: 10,
                    },
                  ],
                  margin: [0, 0, 0, 10],
                },
                {
                  canvas: [
                    {
                      type: 'rect',
                      x: 0,
                      y: 0,
                      w: 200,
                      h: 25,
                      color: '#f3f4f6',
                    },
                  ],
                },
                {
                  columns: [
                    { text: 'TOTAL:', bold: true, fontSize: 12 },
                    {
                      text: this.formatCurrency(total),
                      bold: true,
                      alignment: 'right',
                      fontSize: 12,
                      color: '#667eea',
                    },
                  ],
                  margin: [5, -20, 5, 0],
                },
              ],
            },
          ],
        },

        {
          text: 'PAYMENT DETAILS:',
          style: 'subheader',
          margin: [0, 30, 0, 10],
        },
        {
          columns: [
            {
              width: '50%',
              stack: [
                {
                  text: 'Bank: First National Bank',
                  fontSize: 9,
                  margin: [0, 0, 0, 3],
                },
                {
                  text: 'Account Name: Nkolex Property Management',
                  fontSize: 9,
                  margin: [0, 0, 0, 3],
                },
                {
                  text: 'Account Number: 62 1234 5678 90',
                  fontSize: 9,
                  margin: [0, 0, 0, 3],
                },
              ],
            },
            {
              width: '50%',
              stack: [
                {
                  text: 'Branch Code: 250655',
                  fontSize: 9,
                  margin: [0, 0, 0, 3],
                },
                {
                  text: `Reference: ${invoiceNumber}`,
                  fontSize: 9,
                  margin: [0, 0, 0, 3],
                  bold: true,
                },
              ],
            },
          ],
        },

        {
          text: 'Thank you for your business!',
          alignment: 'center',
          fontSize: 9,
          color: '#666',
          margin: [0, 40, 0, 5],
        },
        {
          text: 'For any queries, please contact us at info@nkolex.com',
          alignment: 'center',
          fontSize: 8,
          color: '#999',
        },
      ],
      styles: {
        header: {
          fontSize: 24,
          bold: true,
        },
        invoiceTitle: {
          fontSize: 20,
          bold: true,
          color: '#2d3748',
        },
        subheader: {
          fontSize: 12,
          bold: true,
          color: '#2d3748',
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: 'white',
          fillColor: '#667eea',
        },
      },
      defaultStyle: {
        fontSize: 10,
        color: '#2d3748',
      },
    };

    return documentDefinition;
  }

  async generateAndDownloadInvoice(tenant: Tenant): Promise<void> {
    const documentDefinition = this.generateInvoice(tenant);
    const fileName = `Invoice_${tenant.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;

    const pdfMakeLib = await pdfMakeModule();
    const pdfFontsLib = await pdfFontsModule();

    const pdfMake = (pdfMakeLib as any).default || pdfMakeLib;
    const pdfFonts = (pdfFontsLib as any).default || pdfFontsLib;

    pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs;

    pdfMake.createPdf(documentDefinition).download(fileName);
  }

  async generateMultipleInvoices(tenants: Tenant[]): Promise<void> {
    for (let i = 0; i < tenants.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, i * 500));
      await this.generateAndDownloadInvoice(tenants[i]);
    }
  }

  private formatCurrency(amount: number): string {
    return (
      'R ' +
      amount.toLocaleString('en-ZA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FinancialDataService,
  StatementLine,
} from '../services/financial-data.service';
import { AuthService } from '../services/auth.service';

interface BalanceSheetItem {
  category: string;
  amount: number;
}

@Component({
  selector: 'app-balance-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './balance-sheet.component.html',
  styleUrl: './balance-sheet.component.css',
})
export class BalanceSheetComponent implements OnInit {
  isLoading: boolean = true;
  rawTransactions: StatementLine[] = [];

  assets: BalanceSheetItem[] = [];
  liabilities: BalanceSheetItem[] = [];
  equity: BalanceSheetItem[] = [];
  totalAssets: number = 0;
  totalLiabilities: number = 0;
  totalEquity: number = 0;
  netIncome: number = 0;

  constructor(
    private financialDataService: FinancialDataService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: (fullName) => {
        if (fullName) {
          this.loadFinancialData();
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  private loadFinancialData(): void {
    this.isLoading = true;

    this.financialDataService.getRawTransactions().subscribe({
      next: (rawData) => {
        this.rawTransactions = rawData;
        this.calculateNetIncome();
        this.calculateBalanceSheet();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.isLoading = false;
      },
    });
  }

  private calculateNetIncome(): void {
    const totalRevenue = this.rawTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = Math.abs(
      this.rawTransactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0),
    );

    this.netIncome = totalRevenue - totalExpenses;
  }

  private calculateBalanceSheet(): void {
    const totalCash = this.rawTransactions.reduce(
      (sum, t) => sum + t.amount,
      0,
    );

    this.assets = [
      {
        category: 'Cash and Cash Equivalents',
        amount: totalCash > 0 ? totalCash : 0,
      },
      { category: 'Accounts Receivable', amount: 0 },
      { category: 'Property Value', amount: 0 },
    ];

    const totalPayables = Math.abs(
      this.rawTransactions
        .filter(
          (t) =>
            t.amount < 0 && t.description.toLowerCase().includes('payable'),
        )
        .reduce((sum, t) => sum + t.amount, 0),
    );

    this.liabilities = [
      { category: 'Accounts Payable', amount: totalPayables },
      { category: 'Mortgage Payable', amount: 0 },
      { category: 'Other Liabilities', amount: 0 },
    ];

    const retainedEarnings = this.netIncome;

    this.equity = [
      { category: 'Retained Earnings', amount: retainedEarnings },
      { category: "Owner's Equity", amount: 0 },
    ];

    this.totalAssets = this.assets.reduce((sum, item) => sum + item.amount, 0);
    this.totalLiabilities = this.liabilities.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    this.totalEquity =
      this.equity.reduce((sum, item) => sum + item.amount, 0) +
      (this.totalAssets - this.totalLiabilities - this.totalEquity);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  exportToPDF(): void {
    alert('PDF export functionality coming soon!');
  }

  exportToExcel(): void {
    alert('Excel export functionality coming soon!');
  }
}

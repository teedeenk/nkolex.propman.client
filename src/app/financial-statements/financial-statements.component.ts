import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FinancialDataService,
  FinancialData,
  StatementLine,
} from '../services/financial-data.service';
import { AuthService } from '../services/auth.service';

interface PLItem {
  category: string;
  amount: number;
}

interface BalanceSheetItem {
  category: string;
  amount: number;
}

@Component({
  selector: 'app-financial-statements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financial-statements.component.html',
  styleUrl: './financial-statements.component.css',
})
export class FinancialStatementsComponent implements OnInit {
  isLoading: boolean = true;
  financialData: FinancialData[] = [];
  rawTransactions: StatementLine[] = [];

  // Profit & Loss Statement
  revenue: PLItem[] = [];
  expenses: PLItem[] = [];
  totalRevenue: number = 0;
  totalExpenses: number = 0;
  netIncome: number = 0;

  // Balance Sheet
  assets: BalanceSheetItem[] = [];
  liabilities: BalanceSheetItem[] = [];
  equity: BalanceSheetItem[] = [];
  totalAssets: number = 0;
  totalLiabilities: number = 0;
  totalEquity: number = 0;

  selectedPeriod: string = 'all';

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

    this.financialDataService.getFinancialData().subscribe({
      next: (data) => {
        this.financialData = data;

        this.financialDataService.getRawTransactions().subscribe({
          next: (rawData) => {
            this.rawTransactions = rawData;
            this.calculateStatements();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading raw transactions:', error);
            this.calculateStatements();
            this.isLoading = false;
          },
        });
      },
      error: (error) => {
        console.error('Error loading financial data:', error);
        this.isLoading = false;
      },
    });
  }

  private calculateStatements(): void {
    this.calculateProfitAndLoss();
    this.calculateBalanceSheet();
  }

  private calculateProfitAndLoss(): void {
    const revenueCategories = new Map<string, number>();
    const expenseCategories = new Map<string, number>();

    // Process transactions
    this.rawTransactions.forEach((transaction) => {
      const amount = Math.abs(transaction.amount);
      const description = transaction.description.toLowerCase();

      // Categorize as revenue or expense based on amount sign and description
      if (transaction.amount > 0) {
        // Income/Revenue
        let category = 'Other Income';
        if (description.includes('rent') || description.includes('rental')) {
          category = 'Rental Income';
        } else if (description.includes('deposit')) {
          category = 'Deposits Received';
        } else if (
          description.includes('transfer') ||
          description.includes('payment received')
        ) {
          category = 'Other Receipts';
        }

        revenueCategories.set(
          category,
          (revenueCategories.get(category) || 0) + amount,
        );
      } else {
        // Expenses
        let category = 'Other Expenses';
        if (description.includes('insurance')) {
          category = 'Insurance';
        } else if (
          description.includes('maintenance') ||
          description.includes('repair')
        ) {
          category = 'Maintenance & Repairs';
        } else if (
          description.includes('utility') ||
          description.includes('utilities') ||
          description.includes('electric') ||
          description.includes('water') ||
          description.includes('gas')
        ) {
          category = 'Utilities';
        } else if (
          description.includes('tax') ||
          description.includes('rates')
        ) {
          category = 'Property Tax';
        } else if (
          description.includes('management') ||
          description.includes('fee')
        ) {
          category = 'Management Fees';
        } else if (
          description.includes('mortgage') ||
          description.includes('loan')
        ) {
          category = 'Mortgage/Loan Payments';
        } else if (
          description.includes('advertising') ||
          description.includes('marketing')
        ) {
          category = 'Marketing';
        }

        expenseCategories.set(
          category,
          (expenseCategories.get(category) || 0) + amount,
        );
      }
    });

    // Convert to arrays and sort
    this.revenue = Array.from(revenueCategories.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    this.expenses = Array.from(expenseCategories.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Calculate totals
    this.totalRevenue = this.revenue.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    this.totalExpenses = this.expenses.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    this.netIncome = this.totalRevenue - this.totalExpenses;
  }

  private calculateBalanceSheet(): void {
    // Assets
    const totalCash = this.rawTransactions.reduce(
      (sum, t) => sum + t.amount,
      0,
    );

    this.assets = [
      {
        category: 'Cash and Cash Equivalents',
        amount: totalCash > 0 ? totalCash : 0,
      },
      { category: 'Accounts Receivable', amount: 0 }, // Can be calculated from pending payments
      { category: 'Property Value', amount: 0 }, // Would need property valuation data
    ];

    // Liabilities
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
      { category: 'Mortgage Payable', amount: 0 }, // Would need mortgage data
      { category: 'Other Liabilities', amount: 0 },
    ];

    // Equity
    const retainedEarnings = this.netIncome;

    this.equity = [
      { category: 'Retained Earnings', amount: retainedEarnings },
      { category: "Owner's Equity", amount: 0 },
    ];

    // Calculate totals
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
    // TODO: Implement PDF export functionality
    alert('PDF export functionality coming soon!');
  }

  exportToExcel(): void {
    // TODO: Implement Excel export functionality
    alert('Excel export functionality coming soon!');
  }
}

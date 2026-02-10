import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FinancialDataService,
  StatementLine,
} from '../services/financial-data.service';
import { AuthService } from '../services/auth.service';

interface PLItem {
  category: string;
  amount: number;
}

@Component({
  selector: 'app-profit-loss',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profit-loss.component.html',
  styleUrl: './profit-loss.component.css',
})
export class ProfitLossComponent implements OnInit {
  isLoading: boolean = true;
  rawTransactions: StatementLine[] = [];

  revenue: PLItem[] = [];
  expenses: PLItem[] = [];
  totalRevenue: number = 0;
  totalExpenses: number = 0;
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
        this.calculateProfitAndLoss();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.isLoading = false;
      },
    });
  }

  private calculateProfitAndLoss(): void {
    const revenueCategories = new Map<string, number>();
    const expenseCategories = new Map<string, number>();

    this.rawTransactions.forEach((transaction) => {
      const amount = Math.abs(transaction.amount);
      const description = transaction.description.toLowerCase();

      if (transaction.amount > 0) {
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

    this.revenue = Array.from(revenueCategories.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    this.expenses = Array.from(expenseCategories.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

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

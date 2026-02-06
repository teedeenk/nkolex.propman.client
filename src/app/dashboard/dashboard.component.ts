import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {
  FinancialDataService,
  FinancialData,
  StatementLine,
} from '../services/financial-data.service';
import { ActivityService, Activity } from '../services/activity.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  isLoading: boolean = true;
  fullName: string | null = null;
  isMenuOpen: boolean = false;
  isLoadingFinancialData: boolean = true;
  financialDataError: string | null = null;

  financialData: FinancialData[] = [];
  rawTransactions: StatementLine[] = [];
  redirectCountdown: number = 0;
  countdownActive: boolean = false;
  private countdownInterval: any;

  // Activity carousel properties
  upcomingActivities: Activity[] = [];
  currentActivityIndex: number = 0;

  constructor(
    private authService: AuthService,
    private financialDataService: FinancialDataService,
    private activityService: ActivityService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: (fullName) => {
        if (fullName) {
          this.fullName = fullName;
          this.isLoading = false;
          this.loadFinancialData();
          this.loadActivities();
        } else {
          this.isLoading = false;
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        console.error('[Dashboard] Error fetching user data:', error);
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
    });
  }

  private loadActivities(): void {
    this.activityService.getActivities().subscribe((activities) => {
      this.upcomingActivities = activities
        .filter((activity) => activity.status === 'upcoming')
        .sort((a, b) => {
          const dateA = new Date(a.date + ' ' + a.time);
          const dateB = new Date(b.date + ' ' + b.time);
          return dateA.getTime() - dateB.getTime();
        });
    });
  }

  private loadFinancialData(): void {
    this.isLoadingFinancialData = true;
    this.financialDataError = null;

    // Load both financial data and raw transactions
    this.financialDataService.getFinancialData().subscribe({
      next: (data) => {
        this.financialData = data;

        // Also load raw transactions for keyword filtering
        this.financialDataService.getRawTransactions().subscribe({
          next: (rawData) => {
            this.rawTransactions = rawData;
            this.isLoadingFinancialData = false;
          },
          error: (error) => {
            console.error(
              '[Dashboard] Error fetching raw transactions:',
              error,
            );
            // Continue even if raw transactions fail
            this.isLoadingFinancialData = false;
          },
        });
      },
      error: (error) => {
        console.error('[Dashboard] Error fetching financial data:', error);

        if (error.message.includes('Authentication failed')) {
          this.financialDataError =
            'Authentication failed. You will be redirected to login in 10 seconds.';

          // Start countdown redirect
          this.startRedirectCountdown();
        } else {
          this.financialDataError =
            'Failed to load financial data. Please try again.';
        }

        this.isLoadingFinancialData = false;
        this.financialData = [];
        this.rawTransactions = [];
      },
    });
  }

  public retryLoadFinancialData(): void {
    this.loadFinancialData();
  }

  private startRedirectCountdown(): void {
    this.redirectCountdown = 10;
    this.countdownActive = true;

    this.countdownInterval = setInterval(() => {
      this.redirectCountdown--;

      // Update the error message with countdown
      this.financialDataError = `Authentication failed. Redirecting to login in ${this.redirectCountdown} seconds.`;

      if (this.redirectCountdown <= 0) {
        this.clearCountdown();
        this.router.navigate(['/login']);
      }
    }, 1000);
  }

  public cancelRedirect(): void {
    this.clearCountdown();
    this.financialDataError =
      'Authentication failed. Please refresh the page and login again.';
  }

  private clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.countdownActive = false;
    this.redirectCountdown = 0;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  navigateToProfile(): void {
    console.log('Navigate to profile');
    this.closeMenu();
  }

  navigateToSettings(): void {
    console.log('Navigate to settings');
    this.closeMenu();
  }

  navigateToDocumentation(): void {
    console.log('Navigate to documentation');
    this.closeMenu();
  }

  navigateToUpload(): void {
    this.router.navigate(['/upload']);
  }

  navigateToActivities(): void {
    this.router.navigate(['/activities']);
  }

  // Activity carousel methods
  nextActivity(): void {
    if (this.upcomingActivities.length > 0) {
      this.currentActivityIndex =
        (this.currentActivityIndex + 1) % this.upcomingActivities.length;
    }
  }

  previousActivity(): void {
    if (this.upcomingActivities.length > 0) {
      this.currentActivityIndex =
        (this.currentActivityIndex - 1 + this.upcomingActivities.length) %
        this.upcomingActivities.length;
    }
  }

  getCurrentActivity(): Activity | null {
    return this.upcomingActivities.length > 0
      ? this.upcomingActivities[this.currentActivityIndex]
      : null;
  }

  formatActivityDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  formatActivityTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  getMaxValue(): number {
    if (this.financialData.length === 0) {
      return 1;
    }
    const allValues = this.financialData.flatMap((d) => [d.income, d.expenses]);
    return Math.max(...allValues);
  }

  getBarHeight(value: number): number {
    const max = this.getMaxValue();
    return (value / max) * 100;
  }

  formatCurrency(value: number): string {
    return '$' + value.toLocaleString();
  }

  getTotalIncome(): number {
    return this.financialData.reduce((total, data) => total + data.income, 0);
  }

  getTotalExpenses(): number {
    return this.financialData.reduce((total, data) => total + data.expenses, 0);
  }

  getNetBalance(): number {
    return this.getTotalIncome() - this.getTotalExpenses();
  }

  formatCurrencyWithR(value: number): string {
    return (
      'R ' +
      value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  private calculateTransactionAmountByKeyword(keyword: string): number {
    if (!this.rawTransactions || this.rawTransactions.length === 0) {
      return 0;
    }

    return this.rawTransactions
      .filter(
        (transaction) =>
          transaction.description &&
          transaction.description.toLowerCase().includes(keyword.toLowerCase()),
      )
      .reduce((total, transaction) => {
        // For income items like rent, take positive amounts
        // For expense items, take absolute value of negative amounts
        if (keyword === 'rent') {
          return total + (transaction.amount > 0 ? transaction.amount : 0);
        } else {
          // For expenses, take absolute value of negative amounts
          return (
            total + (transaction.amount < 0 ? Math.abs(transaction.amount) : 0)
          );
        }
      }, 0);
  }

  getRentalIncome(): number {
    return this.calculateTransactionAmountByKeyword('rent');
  }

  getMaintenanceExpenses(): number {
    return this.calculateTransactionAmountByKeyword('maintenance');
  }

  getWagesExpenses(): number {
    return this.calculateTransactionAmountByKeyword('wages');
  }

  getUtilitiesExpenses(): number {
    return this.calculateTransactionAmountByKeyword('bill');
  }

  private calculatePercentageChange(
    keyword: string,
    isIncome: boolean = false,
  ): { percentage: number; isPositive: boolean; hasChange: boolean } {
    if (!this.rawTransactions || this.rawTransactions.length === 0) {
      return { percentage: 0, isPositive: false, hasChange: false };
    }

    // Get transactions for this keyword
    const keywordTransactions = this.rawTransactions.filter(
      (transaction) =>
        transaction.description &&
        transaction.description.toLowerCase().includes(keyword.toLowerCase()),
    );

    console.log(
      `[${keyword}] Found ${keywordTransactions.length} transactions:`,
      keywordTransactions,
    );

    if (keywordTransactions.length === 0) {
      return { percentage: 0, isPositive: false, hasChange: false };
    }

    // Group by month and sum all transactions for each month
    const monthlyTotals: { [key: string]: number } = {};

    keywordTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = 0;
      }

      // For each transaction, add the appropriate amount to the monthly total
      if (isIncome) {
        // For income (like rent), sum all positive amounts in the month
        if (transaction.amount > 0) {
          monthlyTotals[monthKey] += transaction.amount;
        }
      } else {
        // For expenses, sum all negative amounts (as positive values) in the month
        if (transaction.amount < 0) {
          monthlyTotals[monthKey] += Math.abs(transaction.amount);
        }
      }
    });

    console.log(`[${keyword}] Monthly totals after grouping:`, monthlyTotals);

    // Sort months chronologically
    const monthKeys = Object.keys(monthlyTotals).sort();
    console.log(`[${keyword}] Sorted month keys:`, monthKeys);

    if (monthKeys.length < 2) {
      console.log(
        `[${keyword}] Not enough months for comparison (${monthKeys.length})`,
      );
      return { percentage: 0, isPositive: false, hasChange: false };
    }

    // Compare most recent month with previous month
    const currentMonthKey = monthKeys[monthKeys.length - 1];
    const previousMonthKey = monthKeys[monthKeys.length - 2];
    const currentMonth = monthlyTotals[currentMonthKey];
    const previousMonth = monthlyTotals[previousMonthKey];

    console.log(`[${keyword}] Comparing:`);
    console.log(`  - Previous month (${previousMonthKey}): ${previousMonth}`);
    console.log(`  - Current month (${currentMonthKey}): ${currentMonth}`);

    if (previousMonth === 0 && currentMonth === 0) {
      return { percentage: 0, isPositive: false, hasChange: false };
    }

    if (currentMonth + previousMonth === 0) {
      return { percentage: 0, isPositive: false, hasChange: false };
    }

    // Calculate percentage change: ((new - old) / old) * 100
    const change = ((currentMonth - previousMonth) / previousMonth) * 100;
    console.log(
      `[${keyword}] Percentage change: ((${currentMonth} - ${previousMonth}) / ${previousMonth}) * 100 = ${change}%`,
    );

    return {
      percentage: Math.abs(change),
      isPositive: change >= 0,
      hasChange: Math.abs(change) > 0.1, // Consider changes > 0.1% as significant
    };
  }

  getRentalIncomeChange(): {
    percentage: number;
    isPositive: boolean;
    hasChange: boolean;
  } {
    return this.calculatePercentageChange('rent', true);
  }

  getMaintenanceChange(): {
    percentage: number;
    isPositive: boolean;
    hasChange: boolean;
  } {
    return this.calculatePercentageChange('maintenance', false);
  }

  getWagesChange(): {
    percentage: number;
    isPositive: boolean;
    hasChange: boolean;
  } {
    return this.calculatePercentageChange('wages', false);
  }

  getUtilitiesChange(): {
    percentage: number;
    isPositive: boolean;
    hasChange: boolean;
  } {
    return this.calculatePercentageChange('bill', false);
  }

  formatPercentageChange(change: {
    percentage: number;
    isPositive: boolean;
    hasChange: boolean;
  }): string {
    if (!change.hasChange) {
      return 'No change';
    }

    const sign = change.isPositive ? '+' : '-';
    return `${sign}${change.percentage.toFixed(1)}% from last month`;
  }
}

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
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

  financialData = [
    { month: 'Jan', income: 4500, expenses: 3200 },
    { month: 'Feb', income: 5200, expenses: 3800 },
    { month: 'Mar', income: 4800, expenses: 3500 },
    { month: 'Apr', income: 6100, expenses: 4200 },
    { month: 'May', income: 5500, expenses: 3900 },
    { month: 'Jun', income: 5800, expenses: 4100 },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: (fullName) => {
        if (fullName) {
          this.fullName = fullName;
          this.isLoading = false;
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

  getMaxValue(): number {
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
}

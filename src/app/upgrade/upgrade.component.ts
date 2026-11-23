import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SubscriptionService } from '../services/subscription.service';

@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upgrade.component.html',
  styleUrls: ['./upgrade.component.css'],
})
export class UpgradeComponent {
  showDonateDetails: boolean = false;
  copiedField: string | null = null;

  readonly bankName = 'Nedbank';
  readonly accountName = 'Nkolex Property Management';
  readonly accountNumber = '1105167364';
  readonly branchCode = '198765';

  isConfirmingDowngrade = false;
  isDowngrading = false;
  downgradeError = '';

  constructor(
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private router: Router,
  ) {}

  get isPremium(): boolean {
    return this.authService.getSubscriptionTier() === 'Premium';
  }

  startDowngrade(): void {
    this.downgradeError = '';
    this.isConfirmingDowngrade = true;
  }

  cancelDowngrade(): void {
    this.isConfirmingDowngrade = false;
  }

  confirmDowngrade(): void {
    this.isDowngrading = true;
    this.downgradeError = '';
    this.subscriptionService.downgrade().subscribe({
      next: () => {
        this.isDowngrading = false;
        this.isConfirmingDowngrade = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Downgrade failed', error);
        this.downgradeError =
          error.error?.message ??
          'Your plan could not be changed. Please try again or contact support.';
        this.isDowngrading = false;
      },
    });
  }

  get emailPrefix(): string {
    return this.authService.getEmail() || 'youremail@example.com';
  }

  get upgradeReference(): string {
    return `${this.emailPrefix}-upgrade`;
  }

  get donateReference(): string {
    return `${this.emailPrefix}-donation`;
  }

  toggleDonateDetails(): void {
    this.showDonateDetails = !this.showDonateDetails;
  }

  copyToClipboard(value: string, field: string): void {
    navigator.clipboard?.writeText(value).then(() => {
      this.copiedField = field;
      setTimeout(() => {
        if (this.copiedField === field) {
          this.copiedField = null;
        }
      }, 2000);
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}

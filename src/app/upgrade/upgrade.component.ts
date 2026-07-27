import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

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

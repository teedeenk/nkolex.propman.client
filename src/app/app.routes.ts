import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UploadComponent } from './upload/upload.component';
import { ActivitiesComponent } from './activities/activities.component';
import { TenantsComponent } from './tenants/tenants.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { FinancialStatementsComponent } from './financial-statements/financial-statements.component';
import { ProfitLossComponent } from './profit-loss/profit-loss.component';
import { BalanceSheetComponent } from './balance-sheet/balance-sheet.component';
import { PropertiesComponent } from './properties/properties.component';
import { AdminPortalComponent } from './admin-portal/admin-portal.component';
import { UpgradeComponent } from './upgrade/upgrade.component';
import { DisclaimerComponent } from './disclaimer/disclaimer.component';
import { TermsComponent } from './terms/terms.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { authGuard, guestGuard, premiumGuard, adminGuard } from './guards/auth.gurard';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'reset-password', component: ResetPasswordComponent, canActivate: [guestGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'upload', component: UploadComponent, canActivate: [authGuard] },
  { path: 'activities', component: ActivitiesComponent, canActivate: [authGuard, premiumGuard] },
  { path: 'tenants', component: TenantsComponent, canActivate: [authGuard] },
  { path: 'invoices', component: InvoicesComponent, canActivate: [authGuard] },
  { path: 'financial-statements', component: FinancialStatementsComponent, canActivate: [authGuard, premiumGuard] },
  { path: 'profit-loss', component: ProfitLossComponent, canActivate: [authGuard, premiumGuard] },
  { path: 'balance-sheet', component: BalanceSheetComponent, canActivate: [authGuard, premiumGuard] },
  { path: 'properties', component: PropertiesComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminPortalComponent, canActivate: [authGuard, adminGuard] },
  { path: 'upgrade', component: UpgradeComponent, canActivate: [authGuard] },
  { path: 'disclaimer', component: DisclaimerComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: '', pathMatch: 'full', redirectTo: '' },
  { path: '**', redirectTo: '' }, 
];

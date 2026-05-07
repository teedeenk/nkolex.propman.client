import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UploadComponent } from './upload/upload.component';
import { ActivitiesComponent } from './activities/activities.component';
import { TenantsComponent } from './tenants/tenants.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { FinancialStatementsComponent } from './financial-statements/financial-statements.component';
import { ProfitLossComponent } from './profit-loss/profit-loss.component';
import { BalanceSheetComponent } from './balance-sheet/balance-sheet.component';
import { PropertiesComponent } from './properties/properties.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'upload', component: UploadComponent },
  { path: 'activities', component: ActivitiesComponent },
  { path: 'tenants', component: TenantsComponent },
  { path: 'invoices', component: InvoicesComponent },
  { path: 'financial-statements', component: FinancialStatementsComponent },
  { path: 'profit-loss', component: ProfitLossComponent },
  { path: 'balance-sheet', component: BalanceSheetComponent },
  { path: 'properties', component: PropertiesComponent },
  { path: '', pathMatch: 'full', redirectTo: '' }, // stays on AppComponent (landing page)
  { path: '**', redirectTo: '' }, // redirect unknown routes to landing page
];

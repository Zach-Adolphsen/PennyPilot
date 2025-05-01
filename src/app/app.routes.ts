import { Routes } from '@angular/router';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { AccountComponent } from './Components/account/account.component';
import { IncomePageComponent } from './income-page/income-page.component';
import { ExpensePageComponent } from './expense-page/expense-page.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: DashboardComponent },
  { path: 'account', component: AccountComponent },
  { path: 'income', component: IncomePageComponent },
  { path: 'expense', component: ExpensePageComponent },
];

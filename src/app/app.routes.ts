import { Routes } from '@angular/router';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { AccountComponent } from './Components/auth/account/account.component';
import { IncomePageComponent } from './income-page/income-page.component';
import { ExpensePageComponent } from './expense-page/expense-page.component';
import { LoginComponent } from './Components/auth/login/login.component';
import { RegisterComponent } from './Components/auth/register/register.component';
import { VerifyEmailComponent } from './Components/auth/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './Components/auth/forgot-password/forgot-password.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: DashboardComponent },
  { path: 'account', component: AccountComponent },
  { path: 'income', component: IncomePageComponent },
  { path: 'expense', component: ExpensePageComponent },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'verify-email',
    component: VerifyEmailComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Register',
  },
];

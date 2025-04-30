import { Routes } from '@angular/router';
import { IncomeCardComponent } from './Components/income-card/income-card.component';
import { ExpenseCardComponent } from './Components/expense-card/expense-card.component';

export const routes: Routes = [
   {path: 'income', component: IncomeCardComponent} ,
   {path: 'expenses', component: ExpenseCardComponent} ,
];

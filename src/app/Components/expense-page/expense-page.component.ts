import { Component } from '@angular/core';
import { AddExpenseComponent } from '../add-expense/add-expense.component';
import { ExpenseListComponent } from '../expense-list/expense-list.component';

@Component({
  selector: 'app-expense-page',
  imports: [AddExpenseComponent, ExpenseListComponent],
  templateUrl: './expense-page.component.html',
  styleUrl: './expense-page.component.css',
})
export class ExpensePageComponent {}

import { Component, OnInit, inject } from '@angular/core';
import { ExpenseService } from '../../Services/Expense Service/expense.service';
import { AuthService } from '../../Services/Auth Service/auth-service.service';
import { AddExpenseComponent } from '../add-expense/add-expense.component';
import { ExpenseListComponent } from '../expense-list/expense-list.component';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-expense-page',
  imports: [AddExpenseComponent, ExpenseListComponent, CurrencyPipe],
  templateUrl: './expense-page.component.html',
  styleUrls: ['./expense-page.component.css'],
})
export class ExpensePageComponent implements OnInit {
  yearlyExpense: number = 0;
  monthlyExpense: number = 0;

  private authService = inject(AuthService);
  private expenseService = inject(ExpenseService);

  ngOnInit(): void {
    this.expenseService.getTotalExpense().subscribe((totalExpense) => {
      this.yearlyExpense = totalExpense;
    });

    // Calculate monthly expenses
    this.calculateMonthlyExpense();
  }

  calculateMonthlyExpense(): void {
    const currentDate = new Date();
    this.expenseService
      .getMonthlyExpense(currentDate.getMonth(), currentDate.getFullYear())
      .subscribe((monthlyExpense) => {
        this.monthlyExpense = monthlyExpense;
      });
  }
}

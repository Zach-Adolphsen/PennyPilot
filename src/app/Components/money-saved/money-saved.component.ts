import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomeService } from '../../Services/Income Service/income.service';
import { ExpenseService } from '../../Services/Expense Service/expense.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-money-saved',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './money-saved.component.html',
  styleUrl: './money-saved.component.css',
})
export class MoneySavedComponent {
  private incomeService = inject(IncomeService);
  private expenseService = inject(ExpenseService);

  monthlyIncome: number = 0;
  halfMonthlyIncome: number = 0;
  monthlyExpense: number = 0;
  moneySaved: number = 0;
  moneyNeeds: number = 0;
  moneyWants: number = 0;

  ngOnInit() {
    this.calculateSavings();
  }

  calculateSavings() {
    this.incomeService.getMonthlyIncome().subscribe(
      (income) => {
        this.monthlyIncome = income;
        this.halfMonthlyIncome = income / 2;
        this.updateSavings();
      },
      (error) => console.error('Error fetching income:', error)
    );

    this.expenseService.getMonthlyExpense().subscribe(
      (expense) => {
        this.monthlyExpense = expense;
        this.updateSavings();
      },
      (error) => console.error('Error fetching expenses:', error)
    );
  }

  updateSavings() {
    this.moneySaved = this.monthlyIncome - this.monthlyExpense;
    this.moneyNeeds = this.moneySaved * 0.2;
    this.moneyWants = this.moneySaved * 0.3;
  }

  savingsGoal: number = 0;
  get progressPercent(): number {
    return this.savingsGoal > 0
      ? Math.min(100, Math.round((this.moneyNeeds / this.savingsGoal) * 100))
      : 0;
  }

  setSavingsGoal() {
    console.log('Savings goal set to:', this.savingsGoal);
  }
}

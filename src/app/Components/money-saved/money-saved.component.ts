import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomeService } from '../../Services/Income Service/income.service';
import { ExpenseService } from '../../Services/Expense Service/expense.service';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../Services/Firestore Service/firestore.service';
import { Observable } from 'rxjs';

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
  private firestoreService = inject(FirestoreService);

  monthlyIncome: number = 0;
  halfMonthlyIncome: number = 0;
  monthlyExpense: number = 0;
  moneySaved: number = 0;
  moneyNeeds: number = 0;
  moneyWants: number = 0;

  ngOnInit() {
    this.loadSavingsGoal();
    this.calculateSavings();
  }

  calculateSavings() {
    const currentDate = new Date();
    this.incomeService
      .getMonthlyIncome(currentDate.getMonth(), currentDate.getFullYear())
      .subscribe(
        (income) => {
          this.monthlyIncome = income;
          this.halfMonthlyIncome = income / 2;
          this.updateSavings();
        },
        (error) => console.error('Error fetching income:', error)
      );

    this.expenseService
      .getMonthlyExpense(currentDate.getMonth(), currentDate.getFullYear())
      .subscribe(
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

  loadSavingsGoal() {
    this.firestoreService.getSavingsGoal().subscribe({
      next: (goal) => {
        if (goal !== null) {
          this.savingsGoal = goal;
          console.log('Loaded savings goal:', this.savingsGoal);
        } else {
          console.log('No savings goal found or user not logged in.');
        }
      },
      error: (err) => console.error('Error loading savings goal:', err),
    });
  }
  setSavingsGoal() {
    this.firestoreService.setSavingsGoal(this.savingsGoal).subscribe({
      next: () => console.log('Savings goal updated successfully!'),
      error: (err) => console.error('Error updating savings goal:', err),
    });
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ExpenseService } from '../../Services/Expense Service/expense.service';
import { Expense } from '../../expense';

@Component({
  selector: 'app-expense-list',
  imports: [FormsModule, AsyncPipe],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.css',
})
export class ExpenseListComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  editingExpense: Expense | null = null;
  expenseList$: Observable<Expense[]> = this.expenseService.getExpenseList();
  private expenseAddedSubscription!: Subscription;

  ngOnInit(): void {
    this.expenseAddedSubscription = this.expenseService.expenseAdded$.subscribe(
      () => {
        this.expenseList$ = this.expenseService.getExpenseList(); // Refresh the list
      }
    );
  }

  onDeleteExpense(expenseId: string): void {
    this.expenseService.deleteExpense(expenseId).subscribe({
      next: () => {
        console.log('Expense deleted:', expenseId);
        this.expenseList$ = this.expenseService.getExpenseList(); // Refresh the list
      },
      error: (error) => {
        console.error('Error deleting Expense:', error);
      },
    });
  }

  editExpense(expense: Expense): void {
    this.editingExpense = { ...expense };
  }

  saveExpense(): void {
    if (this.editingExpense) {
      this.expenseService.updateExpense(this.editingExpense).subscribe({
        next: () => {
          console.log('Expense updated:', this.editingExpense);
          this.editingExpense = null;
          this.expenseList$ = this.expenseService.getExpenseList(); // Refresh the list
        },
        error: (error) => {
          console.error('Error updating expense:', error);
        },
      });
    }
  }

  cancelEdit(): void {
    this.editingExpense = null;
  }

  trackExpense(index: number, expense: Expense): string {
    return expense.id;
  }
}

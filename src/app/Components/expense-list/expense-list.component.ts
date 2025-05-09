import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ExpenseService } from '../../Services/Expense Service/expense.service';
import { Expense } from '../../expense';
import { Timestamp } from 'firebase/firestore';

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
        this.expenseList$.subscribe((data) =>
          console.log('Expense List Data (after add):', data)
        );
      }
    );
    this.expenseList$ = this.expenseService.getExpenseList(); // Initial load
    this.expenseList$.subscribe((data) =>
      console.log('Expense List Data (initial):', data)
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
    // Testing Reasons
    console.log('Editing Expense:', this.editingExpense);
  }

  saveExpense(): void {
    if (this.editingExpense) {
      console.log('Saving Expense:', this.editingExpense);

      // ----------- Check if amount is of number type (amount should be) ----------
      if (!(typeof this.editingExpense.amount === 'number')) {
        console.error('Invalid amount entered.');
        return;
      }

      // ----------- Convert date string to Firebase Timestamp --------------
      if (
        this.editingExpense.date &&
        typeof this.editingExpense.date === 'string'
      ) {
        // Added check for this.editingExpense.date
        try {
          const [month, day, year] = this.editingExpense.date
            .split('/')
            .map(Number);
          this.editingExpense.date = Timestamp.fromDate(
            new Date(year, month - 1, day)
          ).toDate();
        } catch (error) {
          console.error('Error parsing date string:', error);
          return; // Prevent saving with an invalid date
        }
      } else {
        console.error('Invalid date value provided.');
        return;
      }

      this.expenseService.updateExpense(this.editingExpense).subscribe({
        next: () => {
          console.log('Expense updated:', this.editingExpense);
          this.editingExpense = null;
          this.expenseList$ = this.expenseService.getExpenseList(); // Refresh the list
          this.expenseList$.subscribe((data) =>
            console.log('Expense List Data (after save):', data)
          );
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

  trackExpense(expense: Expense) {
    return expense.id;
  }
}

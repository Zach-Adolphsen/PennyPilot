import { Component, inject, OnInit } from '@angular/core';
import { ExpenseService } from '../../Services/Expense Service/expense.service';
import { Expense } from '../../expense';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp

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
        this.expenseList$ = this.expenseService.getExpenseList();
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
        console.error('Error deleting expense:', error);
      },
    });
  }

  editExpense(expense: Expense): void {
    this.editingExpense = { ...expense };
    // If the date is a Timestamp when editing, convert it to MM/DD/YYYY string
    if (this.editingExpense.date instanceof Timestamp) {
      const jsDate = this.editingExpense.date.toDate();
      const month = (jsDate.getMonth() + 1).toString().padStart(2, '0');
      const day = jsDate.getDate().toString().padStart(2, '0');
      const year = jsDate.getFullYear();
      this.editingExpense.date = `${month}/${day}/${year}`; // Format as MM/DD/YYYY
    }
    console.log('Editing Expense:', this.editingExpense);
    console.log('Current expenseList$ (before edit):', this.expenseList$);
  }

  saveExpense(): void {
    if (this.editingExpense) {
      console.log('Saving Expense:', this.editingExpense);

      // Convert amount to number
      const amount = parseFloat(this.editingExpense.amount as any);
      if (isNaN(amount)) {
        console.error('Invalid amount entered.');
        return;
      }
      this.editingExpense.amount = amount;

      console.log('Date value before parsing:', this.editingExpense.date);

      // Convert date string to Firebase Timestamp
      if (
        this.editingExpense.date &&
        typeof this.editingExpense.date === 'string'
      ) {
        // Added check for this.editingExpense.date
        try {
          const [month, day, year] = this.editingExpense.date
            .split('/')
            .map(Number);
          const dateToSave = Timestamp.fromDate(new Date(year, month - 1, day));
          this.editingExpense.date = dateToSave; // Assign the Timestamp back
        } catch (error) {
          console.error('Error parsing date string:', error);
          return; // Prevent saving with an invalid date
        }
      } else if (this.editingExpense.date instanceof Date) {
        this.editingExpense.date = Timestamp.fromDate(this.editingExpense.date);
      } else if (this.editingExpense.date instanceof Timestamp) {
        // It's already a Timestamp, no need to convert
      } else {
        console.error('Invalid date value provided.');
        return;
      }

      console.log('editingExpense before update:', this.editingExpense); // Debug log

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

  trackExpense(index: number, expense: Expense) {
    return expense.id;
  }
}

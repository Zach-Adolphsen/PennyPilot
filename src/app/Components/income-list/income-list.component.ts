import { Component, inject, OnInit } from '@angular/core';
import { IncomeService } from '../../Services/Income Service/income.service';
import { Income } from '../../income';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp

@Component({
  selector: 'app-income-list',
  imports: [FormsModule, AsyncPipe],
  templateUrl: './income-list.component.html',
  styleUrl: './income-list.component.css',
})
export class IncomeListComponent implements OnInit {
  private incomeService = inject(IncomeService);
  editingIncome: Income | null = null;
  incomeList$: Observable<Income[]> = this.incomeService.getIncomeList();
  private incomeAddedSubscription!: Subscription;

  ngOnInit(): void {
    this.incomeAddedSubscription = this.incomeService.incomeAdded$.subscribe(
      () => {
        this.incomeList$ = this.incomeService.getIncomeList();
        this.incomeList$.subscribe((data) =>
          console.log('Income List Data (after add):', data)
        );
      }
    );
    this.incomeList$ = this.incomeService.getIncomeList(); // Initial load
    this.incomeList$.subscribe((data) =>
      console.log('Income List Data (initial):', data)
    );
  }

  onDeleteIncome(incomeId: string): void {
    this.incomeService.deleteIncome(incomeId).subscribe({
      next: () => {
        console.log('Income deleted:', incomeId);
        this.incomeList$ = this.incomeService.getIncomeList(); // Refresh the list
      },
      error: (error) => {
        console.error('Error deleting income:', error);
      },
    });
  }

  editIncome(income: Income): void {
    this.editingIncome = { ...income };
    // If the date is a Timestamp when editing, convert it to MM/DD/YYYY string
    if (this.editingIncome.date instanceof Timestamp) {
      const jsDate = this.editingIncome.date.toDate();
      const month = (jsDate.getMonth() + 1).toString().padStart(2, '0');
      const day = jsDate.getDate().toString().padStart(2, '0');
      const year = jsDate.getFullYear();
      this.editingIncome.date = `${month}/${day}/${year}`; // Format as MM/DD/YYYY
    }
    console.log('Editing Income:', this.editingIncome);
    console.log('Current incomeList$ (before edit):', this.incomeList$);
  }

  saveIncome(): void {
    if (this.editingIncome) {
      console.log('Saving Income:', this.editingIncome);

      // Convert amount to number
      const amount = parseFloat(this.editingIncome.amount as any);
      if (isNaN(amount)) {
        console.error('Invalid amount entered.');
        return;
      }
      this.editingIncome.amount = amount;

      console.log('Date value before parsing:', this.editingIncome.date);

      // Convert date string to Firebase Timestamp
      if (
        this.editingIncome.date &&
        typeof this.editingIncome.date === 'string'
      ) {
        // Added check for this.editingIncome.date
        try {
          const [month, day, year] = this.editingIncome.date
            .split('/')
            .map(Number);
          const dateToSave = Timestamp.fromDate(new Date(year, month - 1, day));
          this.editingIncome.date = dateToSave; // Assign the Timestamp back
        } catch (error) {
          console.error('Error parsing date string:', error);
          return; // Prevent saving with an invalid date
        }
      } else if (this.editingIncome.date instanceof Date) {
        this.editingIncome.date = Timestamp.fromDate(this.editingIncome.date);
      } else if (this.editingIncome.date instanceof Timestamp) {
        // It's already a Timestamp, no need to convert
      } else {
        console.error('Invalid date value provided.');
        return;
      }

      console.log('editingIncome before update:', this.editingIncome); // Debug log

      this.incomeService.updateIncome(this.editingIncome).subscribe({
        next: () => {
          console.log('Income updated:', this.editingIncome);
          this.editingIncome = null;
          this.incomeList$ = this.incomeService.getIncomeList(); // Refresh the list
          this.incomeList$.subscribe((data) =>
            console.log('Income List Data (after save):', data)
          );
        },
        error: (error) => {
          console.error('Error updating income:', error);
        },
      });
    }
  }

  cancelEdit(): void {
    this.editingIncome = null;
  }

  trackIncome(index: number, income: Income) {
    return income.id;
  }
}

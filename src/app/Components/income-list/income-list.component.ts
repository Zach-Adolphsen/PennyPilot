import { Component, inject, OnInit } from '@angular/core';
import { IncomeService } from '../../Services/Income Service/income.service';
import { Income } from '../../Interfaces/income';
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
    // Testing Reasons
    console.log('Editing Income:', this.editingIncome);
  }

  saveIncome(): void {
    if (this.editingIncome) {
      console.log('Saving Income:', this.editingIncome);

      // ----------- Check if amount is of number type (amount should be) ----------
      if (!(typeof this.editingIncome.amount === 'number')) {
        console.error('Invalid amount entered.');
        return;
      }

      // ----------- Convert date string to Firebase Timestamp --------------
      if (
        this.editingIncome.date &&
        typeof this.editingIncome.date === 'string'
      ) {
        // Added check for this.editingIncome.date
        try {
          const [month, day, year] = (this.editingIncome.date as string)
            .split('/')
            .map(Number);
          this.editingIncome.date = Timestamp.fromDate(
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

  trackIncome(income: Income) {
    return income.id;
  }
}

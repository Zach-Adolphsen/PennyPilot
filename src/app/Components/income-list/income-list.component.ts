import { Component, inject, OnInit } from '@angular/core';
import { IncomeService } from '../../Services/Income Service/income.service';
import { Income } from '../../income';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';

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

  // ngOnInit(): void {
  //   // this.incomeAddedSubscription = this.incomeService.incomeAdded$.subscribe(
  //   //   () => {
  //   //     this.incomeList$ = this.incomeService.getIncomeList(); // Refresh the list
  //   //     this.incomeList$.subscribe((data) =>
  //   //       console.log('Income List Data:', data)
  //   //     );
  //   //   }
  //   // );
  //   // this.incomeList$.subscribe((data) =>
  //   //   console.log('Initial Income List Data:', data)
  //   // );
  //   this.incomeAddedSubscription = this.incomeService.incomeAdded$.subscribe(
  //     () => {
  //       this.incomeList$ = this.incomeService.getIncomeList(); // Refresh the list
  //     }
  //   );
  // }
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
    console.log('Editing Income:', this.editingIncome);
    console.log('Current incomeList$ (before edit):', this.incomeList$);
  }

  saveIncome(): void {
    if (this.editingIncome) {
      console.log('Saving Income:', this.editingIncome);
      this.incomeService.updateIncome(this.editingIncome).subscribe({
        next: () => {
          console.log('Income updated:', this.editingIncome);
          this.editingIncome = null;
          this.incomeList$ = this.incomeService.getIncomeList(); // Refresh the list
          this.incomeList$.subscribe(data => console.log('Income List Data (after save):', data));
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

  trackIncome(index: number, income: Income): string {
    return income.id;
  }
}

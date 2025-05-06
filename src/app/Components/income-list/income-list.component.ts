import { Component, inject, OnInit } from '@angular/core';
import { IncomeService } from '../../Services/Income Service/income.service';
import { Income } from '../../income';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { AddIncomeComponent } from '../add-income/add-income.component';

@Component({
  selector: 'app-income-list',
  imports: [FormsModule, AsyncPipe, AddIncomeComponent],
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
        this.incomeList$ = this.incomeService.getIncomeList(); // Refresh the list
      }
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
  }

  saveIncome(): void {
    if (this.editingIncome) {
      this.incomeService.updateIncome(this.editingIncome).subscribe({
        next: () => {
          console.log('Income updated:', this.editingIncome);
          this.editingIncome = null;
          this.incomeList$ = this.incomeService.getIncomeList(); // Refresh the list
        },
        error: (error) => {
          console.error('Error updating income:', error);
          // Handle error appropriately
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

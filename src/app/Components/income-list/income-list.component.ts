import { Component, inject, OnInit } from '@angular/core';
import { IncomeService } from '../../Services/Income Service/income.service';
import { Income } from '../../income';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-income-list',
  imports: [FormsModule],
  templateUrl: './income-list.component.html',
  styleUrl: './income-list.component.css',
})
export class IncomeListComponent implements OnInit {
  private incomeService = inject(IncomeService);
  incomeList$!: Observable<Income[]>;
  editingIncome: Income | null = null;

  // get incomeList(): Income[] {
  //   return this.incomeService.incomeList;
  // }

  ngOnInit(): void {
    this.incomeList$ = this.incomeService.getIncomeList();
  }

  // onDeleteIncome(index: number) {
  //   this.incomeService.deleteIncome(index);
  // }
  onDeleteIncome(incomeId: string): void {
    this.incomeService.deleteIncome(incomeId).subscribe({
      next: () => {
        console.log('Income deleted:', incomeId);
        this.incomeList$ = this.incomeService.getIncomeList(); // Refresh the list
      },
      error: (error) => {
        console.error('Error deleting income:', error);
        // Handle error appropriately
      },
    });
  }

  editIncome(income: Income): void {
    this.editingIncome = { ...income };
  }

  // saveIncome(): void {
  //   if (this.editingIncome) {
  //     const index = this.incomeList.findIndex(
  //       (income) => income.id === this.editingIncome!.id
  //     );
  //     if (index !== -1) {
  //       this.incomeList[index] = { ...this.editingIncome };
  //       this.editingIncome = null;
  //       console.log('Income updated:', this.incomeList[index]);
  //     }
  //   }
  // }
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

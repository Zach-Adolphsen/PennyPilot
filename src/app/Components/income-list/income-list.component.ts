import { Component, inject } from '@angular/core';
import { IncomeService } from '../../Services/Income Service/income.service';
import { Income } from '../../income';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-income-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './income-list.component.html',
  styleUrl: './income-list.component.css',
})
export class IncomeListComponent {
  incomeService = inject(IncomeService);
  editingIncome: Income | null = null;

  get incomeList(): Income[] {
    return this.incomeService.incomeList;
  }

  onDeleteIncome(index: number) {
    this.incomeService.deleteIncome(index);
  }

  editIncome(income: Income): void {
    this.editingIncome = { ...income };
  }

  saveIncome(): void {
    if (this.editingIncome) {
      const index = this.incomeList.findIndex(
        (income) => income.id === this.editingIncome!.id
      );
      if (index !== -1) {
        this.incomeList[index] = { ...this.editingIncome };
        this.editingIncome = null;
        console.log('Income updated:', this.incomeList[index]);
      }
    }
  }

  cancelEdit(): void {
    this.editingIncome = null;
  }
}

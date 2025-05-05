import { Component, inject } from '@angular/core';
import { IncomeService } from '../Services/Income Service/income.service';
import { Income } from '../income';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-income-page',
  imports: [FormsModule],
  templateUrl: './income-page.component.html',
  styleUrl: './income-page.component.css',
})
export class IncomePageComponent {
  incomeService = inject(IncomeService);

  get incomeList(): Income[] {
    return this.incomeService.incomeList;
  }

  onAddIncome(date: string, source: string, amount: string) {
    this.incomeService.addIncome(date, source, amount);
    // this.incomeList = [...this.incomeService.incomeList];
    console.log('Income Added: ', { date, source, amount });
    console.log('Updated incomeList: ', this.incomeList);
  }
}

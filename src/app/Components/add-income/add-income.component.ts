import { Component, inject } from '@angular/core';
import { IncomeService } from '../../Services/Income Service/income.service';
import { FormsModule } from '@angular/forms';
import { Income } from '../../income';

@Component({
  selector: 'app-add-income',
  imports: [FormsModule],
  templateUrl: './add-income.component.html',
  styleUrl: './add-income.component.css',
})
export class AddIncomeComponent {
  incomeService = inject(IncomeService);

  get incomeList(): Income[] {
    return this.incomeService.incomeList;
  }

  onAddIncome(date: string, source: string, amount: string) {
    this.incomeService.addIncome(this.incomeList.length, date, source, amount);
  }
}

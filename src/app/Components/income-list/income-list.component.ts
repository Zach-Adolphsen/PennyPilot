import { Component, inject } from '@angular/core';
import { IncomeService } from '../../Services/Income Service/income.service';
import { Income } from '../../income';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-income-list',
  imports: [FormsModule],
  templateUrl: './income-list.component.html',
  styleUrl: './income-list.component.css',
})
export class IncomeListComponent {
  incomeService = inject(IncomeService);

  get incomeList(): Income[] {
    return this.incomeService.incomeList;
  }
}

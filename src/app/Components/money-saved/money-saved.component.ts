import { Component, inject, Input } from '@angular/core';
import { IncomeService } from '../../Services/Income Service/income.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-money-saved',
  imports: [CurrencyPipe],
  templateUrl: './money-saved.component.html',
  styleUrl: './money-saved.component.css',
})
export class MoneySavedComponent {
  private IncomeService = inject(IncomeService);
  monthlyIncome: number = 0; // This will store the weekly income value
  halfMonthlyIncome: number = 0; // This will store half of the weekly income
  // calculateHalfMonthlyIncome(): void {
  //   this.IncomeService.getMonthlyIncome().subscribe(
  //     (income) => {
  //       // Set monthly income to the value received from the service
  //       this.monthlyIncome = income;
  //       // Now calculate half of the monthly income
  //       this.halfMonthlyIncome = this.monthlyIncome / 2;
  //       console.log(`Half of Monthly Income: $${this.halfMonthlyIncome}`);
  //     },
  //     (error) => {
  //       console.error('Error fetching monthly income:', error);
  //     }
  //   );
  // }
  calculateSavings() {
    this.IncomeService.getMonthlyIncome().subscribe(
      (income) => this.monthlyIncome
    );
  }
}

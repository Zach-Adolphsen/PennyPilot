import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../Services/Auth Service/auth-service.service';
import { AddIncomeComponent } from '../add-income/add-income.component';
import { IncomeListComponent } from '../income-list/income-list.component';
import { IncomeService } from '../../Services/Income Service/income.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-income-page',
  imports: [AddIncomeComponent, IncomeListComponent, CurrencyPipe],
  templateUrl: './income-page.component.html',
  styleUrls: ['./income-page.component.css'],
})
export class IncomePageComponent implements OnInit {
  private authService = inject(AuthService);
  private incomeService = inject(IncomeService);

  yearlyIncome: number = 0;
  monthlyIncome: number = 0;

  // subscribes to get income methods in income.service
  ngOnInit(): void {
    this.authService.getCompleteUser().subscribe((user) => {
      if (user) {
        this.incomeService.getMonthlyIncome(new Date()).subscribe((income) => {
          this.monthlyIncome = income;
        });
        this.incomeService
          .getYearlyIncome()
          .subscribe((yearIncome) => (this.yearlyIncome = yearIncome));
      }
    });
  }
}

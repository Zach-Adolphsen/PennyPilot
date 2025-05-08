// import { Component, OnInit, inject } from '@angular/core';
// import { AuthService } from '../../auth-service.service';
// import { AddIncomeComponent } from '../add-income/add-income.component';
// import { IncomeListComponent } from '../income-list/income-list.component';

// @Component({
//   selector: 'app-income-page',
//   imports: [AddIncomeComponent, IncomeListComponent],
//   templateUrl: './income-page.component.html',
//   styleUrls: ['./income-page.component.css'],
// })
// export class IncomePageComponent implements OnInit {
//   yearlyIncome: number = 0;
//   weeklyIncome: number = 0;
//   monthlyIncome: number = 0;

//   private authService = inject(AuthService);

//   ngOnInit(): void {
//     this.authService.getCompleteUser().subscribe((user) => {
//       if (user) {
//         // Use nullish coalescing to assign a default value if yearlyIncome is undefined
//         this.yearlyIncome = user.yearlyIncome ?? 0; // Fallback to 0 if undefined
//         this.weeklyIncome = +(this.yearlyIncome / 52).toFixed(2); // Calculate weekly income
//         this.monthlyIncome = +(this.yearlyIncome / 12).toFixed(2);
//       }
//     });
//   }
// }
import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../auth-service.service';
import { AddIncomeComponent } from '../add-income/add-income.component';
import { IncomeListComponent } from '../income-list/income-list.component';
import { IncomeService } from '../../Services/Income Service/income.service';
import { Income } from '../../income';
import { combineLatest, map, Observable } from 'rxjs';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-income-page',
  imports: [AddIncomeComponent, IncomeListComponent, CurrencyPipe],
  templateUrl: './income-page.component.html',
  styleUrls: ['./income-page.component.css'],
})
export class IncomePageComponent implements OnInit {
  yearlyIncome: number = 0;
  weeklyIncome: number = 0;
  monthlyIncome: number = 0;

  private authService = inject(AuthService);
  private incomeService = inject(IncomeService);

  ngOnInit(): void {
    this.authService.getCompleteUser().subscribe((user) => {
      if (user) {
        this.yearlyIncome = user.yearlyIncome ?? 0;
        this.weeklyIncome = +(this.yearlyIncome / 52).toFixed(2);

        // After setting yearly income, get additional incomes
        this.calculateMonthlyIncome();
      }
    });
  }

  calculateMonthlyIncome(): void {
    this.incomeService.getIncomeList().subscribe((incomeList: Income[]) => {
      const additionalIncomeTotal = incomeList.reduce(
        (sum, income) => sum + (income.amount || 0),
        0
      );
      const baseMonthlyIncome = this.yearlyIncome / 12;
      this.monthlyIncome = +(baseMonthlyIncome + additionalIncomeTotal).toFixed(
        2
      );
    });
  }

  getMonthlyIncome(): Observable<number> {
    return combineLatest([
      this.authService.getCompleteUser(),
      this.incomeService.getIncomeList(),
    ]).pipe(
      map(([user, incomeList]) => {
        const base = (user?.yearlyIncome ?? 0) / 12;
        const additional = incomeList.reduce(
          (sum, inc) => sum + (inc.amount || 0),
          0
        );
        return +(base + additional).toFixed(2);
      })
    );
  }
}

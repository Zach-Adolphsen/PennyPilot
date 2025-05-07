import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IncomeService } from '../Income Service/income.service';

@Injectable({
  providedIn: 'root'
})
export class TotalIncomeService {

  private _totalIncome = new BehaviorSubject<number>(0);
  totalIncome$ = this._totalIncome.asObservable();

  private incomeService = inject(IncomeService);

  constructor() {
    this.loadInitialTotal();
   }

   private loadInitialTotal(): void{
    this.incomeService.getTotalIncome().subscribe(total => {
      this._totalIncome.next(total);
    })
   }

   updateTotal(): void{
    this.incomeService.getTotalIncome().subscribe(total => {
      this._totalIncome.next(total);
    })
   }


}

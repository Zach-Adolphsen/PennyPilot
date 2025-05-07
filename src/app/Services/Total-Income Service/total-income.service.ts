import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IncomeService } from '../Income Service/income.service';

@Injectable({
  providedIn: 'root',
})
export class TotalIncomeService {
  private _totalIncome = new BehaviorSubject<number>(0);
  totalIncome$ = this._totalIncome.asObservable();

  setInitialTotal(total: number): void {
    this._totalIncome.next(total);
  }

  updateTotal(total: number): void {
    this._totalIncome.next(total);
  }
}

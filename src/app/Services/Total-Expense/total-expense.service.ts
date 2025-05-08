import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IncomeService } from '../Income Service/income.service';

@Injectable({
  providedIn: 'root',
})
export class TotalExpenseService {
  private _totalExpense = new BehaviorSubject<number>(0);
  totalExpense$ = this._totalExpense.asObservable();

  setInitialTotal(total: number): void {
    this._totalExpense.next(total);
  }

  updateTotal(total: number): void {
    this._totalExpense.next(total);
  }
}
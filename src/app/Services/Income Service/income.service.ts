import { Injectable } from '@angular/core';
import { incomeList } from './incomeList';

@Injectable({
  providedIn: 'root',
})
export class IncomeService {
  constructor() {}

  incomeList = incomeList;

  addIncome(date: string, source: string, amount: string) {
    this.incomeList.push({ date, source, amount });
  }
}

import { Injectable } from '@angular/core';
import { incomeList } from './incomeList';
import { Income } from '../../income';

@Injectable({
  providedIn: 'root',
})
export class IncomeService {
  constructor() {}

  incomeList = incomeList;

  addIncome(id: number, date: string, source: string, amount: number) {
    this.incomeList.push({ id, date, source, amount });
  }

  deleteIncome(index: number) {
    this.incomeList.splice(index, 1);
  }

  getIncomeByIndex(index: number): Income {
    return incomeList[index];
  }
}

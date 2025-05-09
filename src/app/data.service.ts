import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private incomes = new BehaviorSubject<any[]>([]);
  private expenses = new BehaviorSubject<any[]>([]);

  constructor() { }

  setIncomes(incomes: any[]) {
    this.incomes.next(incomes);
  }

  setExpenses(expenses: any[]) {
    this.expenses.next(expenses);
  }

  getIncomes() {
    return this.incomes.asObservable();
  }

  getExpenses() {
    return this.expenses.asObservable();
  }
}

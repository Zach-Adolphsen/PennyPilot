import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private incomes = new BehaviorSubject<any[]>([]);
  private expenses = new BehaviorSubject<any[]>([]);

  constructor() { }

  // Set incomes and expenses data (e.g., called from Income and Expense components)
  setIncomes(incomes: any[]) {
    this.incomes.next(incomes);
  }

  setExpenses(expenses: any[]) {
    this.expenses.next(expenses);
  }

  // Get the latest income and expense data
  getIncomes() {
    return this.incomes.asObservable();
  }

  getExpenses() {
    return this.expenses.asObservable();
  }
}

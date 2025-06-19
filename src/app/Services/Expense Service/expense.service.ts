import { inject, Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  Firestore,
  collectionData,
  limit,
} from '@angular/fire/firestore';
import { Observable, from, switchMap, map, Subject, combineLatest } from 'rxjs';

import { AuthService } from '../Auth Service/auth-service.service';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { tap, take } from 'rxjs/operators'; // Add take
import { Expense } from '../../Interfaces/expense';
import { TotalExpenseService } from '../Total-Expense/total-expense.service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private firestore: Firestore = inject(Firestore);
  private authService = inject(AuthService);
  private totalExpenseService = inject(TotalExpenseService);

  private expenseSourceAdded = new Subject<void>();
  expenseAdded$ = this.expenseSourceAdded.asObservable();

  constructor() {}

  private getUserExpenseCollection(): Observable<
    CollectionReference<DocumentData>
  > {
    return this.authService.getUser().pipe(
      take(1), // Ensure this completes after one emission
      map((user) => {
        if (!user) {
          throw new Error('User not authenticated');
        }
        const userDoc = doc(this.firestore, 'users', user.uid);
        return collection(userDoc, 'ExpenseList');
      })
    );
  }

  getTotalExpense(): Observable<number> {
    return this.getExpenseList().pipe(
      map((expenses) => {
        return expenses.reduce(
          (total, expense) => total + (expense.amount || 0),
          0
        );
      })
    );
  }

  addExpense(expense: Expense): Observable<string> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        if (!user) {
          throw new Error('User not authenticated');
        }
        const userDoc = doc(this.firestore, 'users', user.uid);
        const expenseCollection = collection(userDoc, 'ExpenseList');
        const { id, ...expenseData } = expense;
        const expenseDataWithTimestamp = {
          ...expenseData,
          date:
            expense.date instanceof Timestamp
              ? expense.date
              : Timestamp.fromDate(expense.date as Date),
        };
        return from(addDoc(expenseCollection, expenseDataWithTimestamp)).pipe(
          switchMap((docRef) => {
            this.expenseSourceAdded.next();
            return this.getTotalExpense().pipe(
              map((total) => {
                this.totalExpenseService.updateTotal(total);
                return docRef.id;
              })
            );
          })
        );
      })
    );
  }

  getExpenseList(): Observable<Expense[]> {
    return this.getUserExpenseCollection().pipe(
      switchMap((expenseCollection) => {
        const orderedCollection = query(
          expenseCollection,
          orderBy('date', 'desc')
        );
        return from(getDocs(orderedCollection)).pipe(
          map((snapshot) => {
            const expenses = snapshot.docs.map((doc) => {
              const data = doc.data() as any;
              const date: Timestamp = data.date as Timestamp;
              const formattedDate = date
                ? date.toDate().toLocaleDateString()
                : '';
              const expenseObject = {
                id: doc.id,
                ...data,
                date: formattedDate,
              } as Expense;
              return expenseObject;
            });
            return expenses;
          })
        );
      })
    );
  }

  deleteExpense(expenseId: string): Observable<void> {
    return this.getUserExpenseCollection().pipe(
      switchMap((expenseCollection) => {
        const expenseDocument = doc(expenseCollection, expenseId);
        return from(deleteDoc(expenseDocument));
      })
    );
  }

  updateExpense(expense: Expense): Observable<void> {
    return this.getUserExpenseCollection().pipe(
      switchMap((expenseCollection) => {
        const expenseDocument = doc(expenseCollection, expense.id);
        const updatedData: Partial<Expense> = {};

        if (expense.source !== undefined) {
          updatedData.source = expense.source;
        }
        if (expense.amount !== undefined) {
          updatedData.amount = Number(expense.amount);
        }
        if (expense.date !== undefined) {
          updatedData.date =
            expense.date instanceof Timestamp
              ? expense.date
              : Timestamp.fromDate(expense.date as Date);
        }

        return from(updateDoc(expenseDocument, updatedData));
      })
    );
  }

  getMonthlyExpense(
    currentMonth: number,
    currentYear: number
  ): Observable<number> {
    return combineLatest([
      this.authService.getCompleteUser().pipe(
        take(1) // Ensure this completes after one emission
      ),
      this.getExpenseList(),
    ]).pipe(
      map(([user, expenseList]) => {
        if (!user) {
          console.warn(
            `ExpenseService: No user found for expense calculation ${
              currentMonth + 1
            }/${currentYear}. Returning 0.`
          );
          return 0;
        }
        const monthlyExpenseTotal = expenseList
          .filter((expense) => {
            const expenseDate = new Date(expense.date as string);
            return (
              expenseDate.getMonth() === currentMonth &&
              expenseDate.getFullYear() === currentYear
            );
          })
          .reduce((total, expense) => total + (Number(expense.amount) || 0), 0);
        return +monthlyExpenseTotal.toFixed(2);
      })
    );
  }

  getRecentExpenses(limitCount: number = 3): Observable<Expense[]> {
    return this.getUserExpenseCollection().pipe(
      switchMap((expenseCollection) => {
        const recentExpensesQuery = query(
          expenseCollection,
          orderBy('date', 'desc'),
          limit(limitCount)
        );
        return from(getDocs(recentExpensesQuery)).pipe(
          map((snapshot) => {
            const expenses = snapshot.docs.map((doc) => {
              const data = doc.data() as any;
              const date: Timestamp = data.date as Timestamp;
              const formattedDate = date
                ? date.toDate().toLocaleDateString()
                : '';
              return {
                id: doc.id,
                ...data,
                date: formattedDate,
              } as Expense;
            });
            return expenses;
          })
        );
      })
    );
  }
}

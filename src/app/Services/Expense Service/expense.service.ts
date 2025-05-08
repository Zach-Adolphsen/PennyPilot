import { inject, Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  Firestore,
} from '@angular/fire/firestore';
import { from, map, Observable, Subject, switchMap } from 'rxjs';
import { AuthService } from '../../auth-service.service';
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
import { Expense } from '../../expense';
import { TotalExpenseService } from '../Total-Expense/total-expense.service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private firestore: Firestore = inject(Firestore); // Inject Firestore
  private authService = inject(AuthService);
  private totalExpenseService = inject(TotalExpenseService);

  private expenseSourceAdded = new Subject<void>();
  expenseAdded$ = this.expenseSourceAdded.asObservable();

  constructor() {}

  private getUserExpenseCollection(): Observable<
    CollectionReference<DocumentData>
  > {
    return this.authService.getUser().pipe(
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
              : Timestamp.fromDate(expense.date as Date), // Convert Date to Timestamp
        };
        return from(addDoc(expenseCollection, expenseDataWithTimestamp)).pipe(
          switchMap((docRef) => {
            this.expenseSourceAdded.next(); // Notify that income was added
            return this.getTotalExpense().pipe(
              map((total) => {
                this.totalExpenseService.updateTotal(total); // Update the total
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
              const incomeObject = {
                id: doc.id,
                ...data,
                date: formattedDate,
              } as Expense;
              return incomeObject;
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
          updatedData.amount = Number(expense.amount); // Ensure it's a number
        }
        if (expense.date !== undefined) {
          updatedData.date =
            expense.date instanceof Timestamp
              ? expense.date
              : Timestamp.fromDate(expense.date as Date); // Ensure it's a Timestamp
        }

        return from(updateDoc(expenseDocument, updatedData));
      })
    );
  }
}

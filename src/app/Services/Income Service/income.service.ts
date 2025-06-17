import { Injectable } from '@angular/core';
import { Income } from '../../Interfaces/income';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  CollectionReference,
  DocumentData,
  Firestore,
  collectionData,
  limit,
} from '@angular/fire/firestore';
import {
  Observable,
  from,
  switchMap,
  map,
  Subject,
  combineLatest,
  tap,
} from 'rxjs';
import { AuthService } from '../Auth Service/auth-service.service';
import { inject } from '@angular/core';
import { getDoc, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { TotalIncomeService } from '../Total-Income Service/total-income.service';

@Injectable({
  providedIn: 'root',
})
export class IncomeService {
  private firestore: Firestore = inject(Firestore);
  private totalIncomeService = inject(TotalIncomeService);
  private authService = inject(AuthService);

  private incomeSourceAdded = new Subject<void>();
  incomeAdded$ = this.incomeSourceAdded.asObservable();

  constructor() {}

  private getUserIncomeCollection(): Observable<
    CollectionReference<DocumentData>
  > {
    return this.authService.getUser().pipe(
      map((user) => {
        if (!user) {
          throw new Error('User not authenticated');
        }
        const userDoc = doc(this.firestore, 'users', user.uid);
        return collection(userDoc, `IncomeList`);
      })
    );
  }

  getTotalIncome(): Observable<number> {
    return this.getIncomeList().pipe(
      map((incomes) => {
        return incomes.reduce(
          (total, income) => total + Number(income.amount || 0),
          0
        );
      })
    );
  }

  addIncome(income: Income): Observable<string> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        if (!user) {
          throw new Error('User not authenticated');
        }
        const userDoc = doc(this.firestore, 'users', user.uid);
        const expenseCollection = collection(userDoc, 'IncomeList');
        const { id, ...incomeData } = income;
        const expenseDataWithTimestamp = {
          ...incomeData,
          date:
            income.date instanceof Timestamp
              ? income.date
              : Timestamp.fromDate(income.date as Date),
        };
        return from(addDoc(expenseCollection, expenseDataWithTimestamp)).pipe(
          switchMap((docRef) => {
            this.incomeSourceAdded.next();
            return this.getTotalIncome().pipe(
              map((total) => {
                this.totalIncomeService.updateTotal(total);
                return docRef.id;
              })
            );
          })
        );
      })
    );
  }

  getIncomeList(): Observable<Income[]> {
    return this.getUserIncomeCollection().pipe(
      switchMap((incomeCollection) => {
        const orderedCollection = query(
          incomeCollection,
          orderBy('date', 'desc')
        );
        return from(getDocs(orderedCollection)).pipe(
          map((snapshot) => {
            const incomes = snapshot.docs.map((doc) => {
              const data = doc.data() as any;
              const date: Timestamp = data.date as Timestamp;
              const formattedDate = date
                ? date.toDate().toLocaleDateString()
                : '';
              const incomeObject = {
                id: doc.id,
                ...data,
                date: formattedDate,
              } as Income;
              return incomeObject;
            });
            return incomes;
          })
        );
      })
    );
  }

  updateIncome(income: Income): Observable<void> {
    return this.getUserIncomeCollection().pipe(
      switchMap((incomeCollection) => {
        const incomeDocument = doc(incomeCollection, income.id);
        const updatedData: Partial<Income> = {};

        if (income.source !== undefined) {
          updatedData.source = income.source;
        }
        if (income.amount !== undefined) {
          updatedData.amount = Number(income.amount);
        }
        if (income.date !== undefined) {
          updatedData.date =
            income.date instanceof Timestamp
              ? income.date
              : Timestamp.fromDate(income.date as Date);
        }

        return from(updateDoc(incomeDocument, updatedData));
      })
    );
  }

  deleteIncome(incomeId: string): Observable<void> {
    return this.getUserIncomeCollection().pipe(
      switchMap((incomeCollection) => {
        const incomeDocument = doc(incomeCollection, incomeId);
        return from(deleteDoc(incomeDocument));
      })
    );
  }

  getYearlyIncome(): Observable<number> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        if (!user) throw new Error('User not authenticated');
        const userDocRef = doc(this.firestore, 'users', user.uid);
        return from(getDoc(userDocRef)).pipe(
          map((snapshot) => {
            const data = (snapshot as any).data();
            return data?.yearlyIncome ?? 0;
          })
        );
      })
    );
  }

  getMonthlyIncome(currentDate: Date): Observable<number> {
    return combineLatest([
      this.authService.getCompleteUser(),
      this.getIncomeList(),
    ]).pipe(
      map(([user, incomeList]) => {

        const monthlyIncomeTotal = incomeList
          .filter((income) => {
            const incomeDate = new Date(income.date as string);
            return (
              incomeDate.getMonth() === currentDate.getMonth() &&
              incomeDate.getFullYear() === currentDate.getFullYear()
            );
          })
          .reduce((total, income) => (total = income.amount || 0), 0);

        return +monthlyIncomeTotal.toFixed(2);
      })
    );
  }

  getRecentIncomes(limitCount: number = 3): Observable<Income[]> {
    return this.getUserIncomeCollection().pipe(
      switchMap((incomeCollection) => {
        const orderedCollection = query(
          incomeCollection,
          orderBy('date', 'desc'),
          limit(limitCount)
        );
        return collectionData(orderedCollection, {
          idField: 'id',
        }) as Observable<Income[]>;
      })
    );
  }
}

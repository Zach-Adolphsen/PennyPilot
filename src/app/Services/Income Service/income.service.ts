import { Injectable } from '@angular/core';
import { Income } from '../../income';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  CollectionReference,
  DocumentData,
  Firestore, // Import from AngularFire
} from '@angular/fire/firestore';
import { Observable, from, switchMap, map, Subject } from 'rxjs';
import { AuthService } from '../../auth-service.service';
import { inject } from '@angular/core'; // Import inject
import { orderBy, query, Timestamp } from 'firebase/firestore';
import { TotalIncomeService } from '../Total-Income Service/total-income.service';

@Injectable({
  providedIn: 'root',
})
export class IncomeService {
  private firestore: Firestore = inject(Firestore); // Inject Firestore
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
        return collection(userDoc, 'IncomeList');
      })
    );
  }

  getTotalIncome(): Observable<number> {
    return this.getIncomeList().pipe(
      map((incomes) => {
        return incomes.reduce(
          (total, income) => total + (income.amount || 0),
          0
        );
      })
    );
  }

  addIncome(income: Income): Observable<string> {
    return this.getUserIncomeCollection().pipe(
      switchMap((incomeCollection) => {
        const { id, ...incomeData } = income;
        return from(addDoc(incomeCollection, incomeData)).pipe(
          map((docRef) => {
            this.incomeSourceAdded.next(); // Notify that income was added
            this.totalIncomeService.updateTotal();
            return docRef.id;
          })
        );
      })
    );
  }

  getIncomeList(): Observable<Income[]> {
    return this.getUserIncomeCollection().pipe(
      switchMap((incomeCollection) => {
        const orderedCollection = query(incomeCollection, orderBy('date'));
        return from(getDocs(orderedCollection)).pipe(
          map((snapshot) => {
            return snapshot.docs.map((doc) => {
              const data = doc.data() as any;
              const date: Timestamp = data.date;
              const formattedDate = date
                ? date.toDate().toLocaleDateString()
                : '';

              return { id: doc.id, ...data, date: formattedDate } as Income;
            });
          })
        );
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

  updateIncome(income: Income): Observable<void> {
    return this.getUserIncomeCollection().pipe(
      switchMap((incomeCollection) => {
        const incomeDocument = doc(incomeCollection, income.id);
        return from(updateDoc(incomeDocument, { ...income }));
      })
    );
  }
}

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
  Firestore,
  collectionData,
  limit, // Import from AngularFire
} from '@angular/fire/firestore';
import { Observable, from, switchMap, map, Subject, combineLatest } from 'rxjs';
import { AuthService } from '../../auth-service.service';
import { inject } from '@angular/core'; // Import inject
import { getDoc, orderBy, query, Timestamp } from 'firebase/firestore'; // Import Timestamp
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
          (total, income) => total + Number(income.amount || 0), // Explicitly convert to Number
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
        const incomeCollection = collection(userDoc, 'IncomeList');
        const { id, ...incomeData } = income;
        const incomeDataWithTimestamp = {
          ...incomeData,
          date:
            income.date instanceof Timestamp
              ? income.date
              : Timestamp.fromDate(income.date as Date), // Convert Date to Timestamp
        };
        return from(addDoc(incomeCollection, incomeDataWithTimestamp)).pipe(
          switchMap((docRef) => {
            this.incomeSourceAdded.next(); // Notify that income was added
            return this.getTotalIncome().pipe(
              map((total) => {
                this.totalIncomeService.updateTotal(total); // Update the total
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
          updatedData.amount = Number(income.amount); // Ensure it's a number
        }
        if (income.date !== undefined) {
          updatedData.date =
            income.date instanceof Timestamp
              ? income.date
              : Timestamp.fromDate(income.date as Date); // Ensure it's a Timestamp
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

  setYearlyIncome(amount: number): Observable<void> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        if (!user) throw new Error('User not authenticated');
        const userDocRef = doc(this.firestore, 'users', user.uid);
        return from(updateDoc(userDocRef, { yearlyIncome: amount }));
      })
    );
  }

  getYearlyIncome(): Observable<number> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        if (!user) throw new Error('User not authenticated');
        const userDocRef = doc(this.firestore, 'users', user.uid);
        return from(getDoc(userDocRef)).pipe(
          // or getDoc(userDocRef)
          map((snapshot) => {
            const data = (snapshot as any).data();
            return data?.yearlyIncome ?? 0;
          })
        );
      })
    );
  }

  // Updated method for monthly income
  getMonthlyIncome(): Observable<number> {
    return combineLatest([
      this.authService.getCompleteUser(),
      this.getIncomeList(),
    ]).pipe(
      map(([user, incomeList]) => {
        // Check if incomeList is defined and is an array
        if (!Array.isArray(incomeList)) {
          return 0; // Return 0 if incomeList is not available
        }
        const additional = incomeList.reduce(
          (sum: number, inc: Income) => sum + (inc.amount || 0),
          0
        ); // Add additional income from the income list
        return +additional.toFixed(2); // Return the total monthly income
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

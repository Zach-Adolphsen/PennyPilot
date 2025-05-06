// import { Injectable } from '@angular/core';
// import { incomeList } from './incomeList';
// import { Income } from '../../income';

// @Injectable({
//   providedIn: 'root',
// })
// export class IncomeService {
//   constructor() {}

//   incomeList = incomeList;

//   addIncome(aIncome: Income) {
//     this.incomeList.push(aIncome);
//   }

//   deleteIncome(index: number) {
//     this.incomeList.splice(index, 1);
//   }
// }

import { Injectable, inject } from '@angular/core';
import { Income } from '../../income';
import { firestore } from '../firebase.config'; // Import your Firestore instance
import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  CollectionReference,
  DocumentData,
} from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IncomeService {
  private incomeCollection: CollectionReference<DocumentData>;

  constructor() {
    this.incomeCollection = collection(firestore, 'incomes'); // 'incomes' is the name of your Firestore collection
  }

  addIncome(income: Income): Observable<string> {
    // Remove the id property as Firestore will generate it
    const { id, ...incomeData } = income;
    return from(addDoc(this.incomeCollection, incomeData)).pipe(
      map((docRef) => docRef.id) // Return the newly generated document ID
    );
  }

  getIncomeList(): Observable<Income[]> {
    return from(getDocs(this.incomeCollection)).pipe(
      map((snapshot) => {
        return snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Income)
        );
      })
    );
  }

  deleteIncome(incomeId: string): Observable<void> {
    const incomeDocument = doc(this.incomeCollection, incomeId);
    return from(deleteDoc(incomeDocument));
  }

  updateIncome(income: Income): Observable<void> {
    const incomeDocument = doc(this.incomeCollection, income.id);
    return from(updateDoc(incomeDocument, { ...income }));
  }
}

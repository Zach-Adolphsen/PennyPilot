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
  Firestore, // Import Firestore type
  getFirestore, // Import getFirestore
} from 'firebase/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { initializeApp } from 'firebase/app'; // Import initializeApp
// import { environment } from 'src/environments/environment'; // Corrected path to environment
import { firebaseConfig } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class IncomeService {
  private incomeCollection: CollectionReference<DocumentData>;
  private firestore: Firestore; // Inject Firestore instance

  constructor() {
    // Initialize Firebase app (if not already done globally)
    const app = initializeApp(firebaseConfig);
    this.firestore = getFirestore(app);
    this.incomeCollection = collection(this.firestore, 'incomes'); // Pass the Firestore instance
  }

  addIncome(income: Income): Observable<string> {
    const { id, ...incomeData } = income;
    return from(addDoc(this.incomeCollection, incomeData)).pipe(
      map((docRef) => docRef.id)
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

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
import { Observable, from, switchMap, map } from 'rxjs';
import { AuthService } from '../../auth-service.service';
import { inject } from '@angular/core'; // Import inject

@Injectable({
  providedIn: 'root',
})
export class IncomeService {
  private firestore: Firestore = inject(Firestore); // Inject Firestore

  constructor(private authService: AuthService) {}

  private getUserIncomeCollection(): Observable<
    CollectionReference<DocumentData>
  > {
    return this.authService.getUser().pipe(
      map((user) => {
        if (!user) {
          throw new Error('User not authenticated');
        }
        const userDoc = doc(this.firestore, 'users', user.uid);
        return collection(userDoc, 'income-expense');
      })
    );
  }

  addIncome(income: Income): Observable<string> {
    return this.getUserIncomeCollection().pipe(
      switchMap((incomeCollection) => {
        const { id, ...incomeData } = income;
        return from(addDoc(incomeCollection, incomeData)).pipe(
          map((docRef) => docRef.id)
        );
      })
    );
  }

  getIncomeList(): Observable<Income[]> {
    return this.getUserIncomeCollection().pipe(
      switchMap((incomeCollection) => {
        return from(getDocs(incomeCollection)).pipe(
          map((snapshot) => {
            return snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as Income)
            );
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

// import { Injectable } from '@angular/core';
// import { Income } from '../../income';
// import {
//   collection,
//   doc,
//   addDoc,
//   getDocs,
//   deleteDoc,
//   updateDoc,
//   CollectionReference,
//   DocumentData,
//   Firestore,
//   getFirestore,
// } from 'firebase/firestore';
// import { Observable, from, switchMap, map, filter } from 'rxjs'; // Import filter
// import { initializeApp } from 'firebase/app';
// import { firebaseConfig } from '../../app.config';
// import { AuthService } from '../../auth-service.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class IncomeService {
//   private firestore: Firestore;

//   constructor(private authService: AuthService) {
//     const app = initializeApp(firebaseConfig);
//     this.firestore = getFirestore(app);
//   }

//   private getUserIncomeCollection(): Observable<
//     CollectionReference<DocumentData>
//   > {
//     return this.authService.getUser().pipe(
//       map((user) => {
//         if (!user) {
//           throw new Error('User not authenticated');
//         }
//         const userDoc = doc(this.firestore, 'users', user.uid);
//         return collection(userDoc, 'income-expense');
//       })
//     );
//   }

//   addIncome(income: Income): Observable<string> {
//     return this.getUserIncomeCollection().pipe(
//       switchMap((incomeCollection) => {
//         const { id, ...incomeData } = income;
//         return from(addDoc(incomeCollection, incomeData)).pipe(
//           map((docRef) => docRef.id)
//         );
//       })
//     );
//   }

//   getIncomeList(): Observable<Income[]> {
//     return this.getUserIncomeCollection().pipe(
//       switchMap((incomeCollection) => {
//         return from(getDocs(incomeCollection)).pipe(
//           map((snapshot) => {
//             return snapshot.docs.map(
//               (doc) => ({ id: doc.id, ...doc.data() } as Income)
//             );
//           })
//         );
//       })
//     );
//   }

//   deleteIncome(incomeId: string): Observable<void> {
//     return this.getUserIncomeCollection().pipe(
//       switchMap((incomeCollection) => {
//         const incomeDocument = doc(incomeCollection, incomeId);
//         return from(deleteDoc(incomeDocument));
//       })
//     );
//   }

//   updateIncome(income: Income): Observable<void> {
//     return this.getUserIncomeCollection().pipe(
//       switchMap((incomeCollection) => {
//         const incomeDocument = doc(incomeCollection, income.id);
//         return from(updateDoc(incomeDocument, { ...income }));
//       })
//     );
//   }
// }

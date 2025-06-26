import { User } from 'firebase/auth';
import { Injectable } from '@angular/core';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import {
  AuthService,
  CombinedUser,
} from '../Auth Service/auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private firestore: Firestore = inject(Firestore);
  private authService = inject(AuthService);

  updateUserField(field: string, value: any): Observable<void> {
    return this.authService.currentUser$.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('User not authenticated.'));
        }

        const userDocRef = doc(this.firestore, 'users', user.uid);
        const updateObject = { [field]: value };

        return from(setDoc(userDocRef, updateObject, { merge: true }));
      })
    );
  }

  user$: Observable<CombinedUser | null> = this.authService.getCompleteUser();

  setSavingsGoal(savingsGoal: number): Observable<void> {
    return this.authService.currentUser$.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('User not authenticated.'));
        }
        const userDocRef = doc(this.firestore, 'users', user.uid);
        return from(setDoc(userDocRef, { savingsGoal }, { merge: true }));
      })
    );
  }

  getSavingsGoal(): Observable<number | null> {
    return this.authService.currentUser$.pipe(
      switchMap((user) => {
        if (!user) {
          // If no user is logged in, emit null.
          return of(null);
        }
        const userDocRef = doc(this.firestore, 'users', user.uid);
        return docData(userDocRef).pipe(
          map((userData) =>
            userData ? (userData['savingsGoal'] as number) : null
          )
        );
      })
    );
  }
}

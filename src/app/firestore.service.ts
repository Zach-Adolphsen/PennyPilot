import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Observable, from, switchMap, take } from 'rxjs';
import { AuthService } from './auth-service.service';
import { User } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private firestore: Firestore = inject(Firestore);
  private authService = inject(AuthService);

  updateUserField(field: string, value: any): Observable<void> {
    return this.authService.currentUser$.pipe(
      take(1),
      switchMap((user: User | null) => {
        if (!user?.uid) {
          console.error('User not authenticated.');
          return new Observable<void>((observer) => observer.error('User not authenticated.'));
        }

        const userDocRef = doc(this.firestore, 'users', user.uid);
        const updateObject = { [field]: value };

        return from(setDoc(userDocRef, updateObject, { merge: true })) as Observable<void>;
      })
    );
  }
}
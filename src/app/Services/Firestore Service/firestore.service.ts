import { User } from 'firebase/auth';
import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { AuthService } from './Services/Auth Service/auth-service.service';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

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
          return new Observable<void>((observer) =>
            observer.error('User not authenticated.')
          );
        }

        const userDocRef = doc(this.firestore, 'users', user.uid);
        const updateObject = { [field]: value };

        return from(
          setDoc(userDocRef, updateObject, { merge: true })
        ) as Observable<void>;
      })
    );
  }
}

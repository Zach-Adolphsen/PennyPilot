// import { Injectable } from '@angular/core';
// import { Firestore, doc, setDoc } from '@angular/fire/firestore';
// import { inject } from '@angular/core';
// import { AuthService } from './auth-service.service';// Assuming you have this service
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class FirestoreService {
//   private firestore = inject(Firestore);
//   private authService = inject(AuthService); // To get the current user's UID

//   // Update the user field in Firestore
//   updateUserField(field: string, value: any) {
//     // Subscribe to the Observable to get the current user data
//     return new Observable<void>((observer) => {
//       this.authService.getCompleteUser().subscribe((user) => {
//         if (user) {
//           const userId = user.uid; // Access the UID of the logged-in user
//           const userDocRef = doc(this.firestore, 'users', userId); // Use the UID to target the correct document

//           // Update the field in Firestore
//           setDoc(userDocRef, { [field]: value }, { merge: true })
//             .then(() => {
//               observer.next(); // Emit a successful response
//               observer.complete(); // Complete the observable
//             })
//             .catch((error) => {
//               console.error('Error updating field:', error);
//               observer.error(error); // Emit an error if something goes wrong
//             });
//         } else {
//           console.error('User not authenticated');
//           observer.error('User not authenticated'); // Handle case when no user is found
//         }
//       });
//     });
//   }
// }

import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { AuthService } from './auth-service.service';
import { Observable, from, throwError } from 'rxjs'; // Import from, throwError
import { switchMap, take } from 'rxjs/operators'; // Import switchMap, take

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  updateUserField(field: string, value: any): Observable<void> {
    return this.authService.getCompleteUser().pipe(
      take(1), // Ensure we only take the current user's data once
      switchMap((user) => {
        if (user) {
          const userId = user.uid;
          const userDocRef = doc(this.firestore, 'users', userId);

          // setDoc returns a Promise, convert it to an Observable using `from`
          return from(setDoc(userDocRef, { [field]: value }, { merge: true }));
        } else {
          // If no user, throw an error that the Observable will catch
          const errorMsg = 'User not authenticated to update field.';
          console.error(errorMsg);
          return throwError(() => new Error(errorMsg)); // Use a factory function for throwError
        }
      })
    );
  }
}

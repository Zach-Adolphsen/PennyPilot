import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateCurrentUser,
  updatePhoneNumber,
  updateProfile,
  user,
  User,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { map, Observable, of, switchMap } from 'rxjs';
import { collection } from 'firebase/firestore';

export interface UserInfo {
  fName: string;
  lName: string;
  email: string;
  password: string;
  [key: string]: any;
}

export interface CombinedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  fname?: string;
  lname?: string;
  createdAt?: Date;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private firestore = inject(Firestore);
  currentUser$: Observable<User | null> = user(this.auth);

  login(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password).then(
      () => {
        localStorage.setItem('token', 'true');
        this.router.navigate(['/home']);
      },
      (err) => {
        alert(`Something went wrong: ${err.message} `);
        this.router.navigate(['/login']);
      }
    );
  }

  async register(newUser: UserInfo) {
    try {
      const res = await createUserWithEmailAndPassword(
        this.auth,
        newUser.email,
        newUser.password
      );
      const user: User = res.user;
      const displayName = `${newUser.fName} ${newUser.lName}`;

      await updateProfile(user, { displayName });

      // Create user profile
      await setDoc(doc(this.firestore, 'users', user.uid), {
        fname: newUser.fName,
        lname: newUser.lName,
        email: newUser.email,
        createdAt: new Date(),
      });

      alert('Registration Successful');
      this.router.navigate(['/login']);
    } catch (err: any) {
      alert(err.message);
      this.router.navigate(['/register']);
    }
  }

  logout() {
    signOut(this.auth)
      .then(() => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  forgotPassword(email: string) {
    sendPasswordResetEmail(this.auth, email)
      .then(() => {
        this.router.navigate(['/verify-email']);
      })
      .catch((err) => {
        alert(`Something went wrong: ${err.message}`);
      });
  }

  signInWithGoogle() {
    signInWithPopup(this.auth, new GoogleAuthProvider())
      .then((res) => {
        this.router.navigate(['/home']);
        localStorage.setItem('token', JSON.stringify(res.user));
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  getUser(): Observable<User | null> {
    return this.currentUser$;
  }

  getCompleteUser(): Observable<CombinedUser | null> {
    return this.currentUser$.pipe(
      switchMap((authUser) => {
        if (!authUser) return of(null);

        const userRef = doc(this.firestore, 'users', authUser.uid);
        return docData(userRef).pipe(
          map((firestoreUser) => ({
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            ...(firestoreUser || {}),
          }))
        );
      })
    );
  }
}

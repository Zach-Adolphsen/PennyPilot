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
  User,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

export interface UserInfo {
  fname: string;
  lname: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private firestore = inject(Firestore);

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

  async register(aUser: UserInfo) {
    try {
      const res = await createUserWithEmailAndPassword(this.auth, aUser.email, aUser.password);
      const user: User = res.user;
      const displayName = `${aUser.fname} ${aUser.lname}`;
  
      await updateProfile(user, { displayName });
  
      // Create user profile
      await setDoc(doc(this.firestore, 'users', user.uid), {
        uid: user.uid,
        fname: aUser.fname,
        lname: aUser.lname,
        email: aUser.email,
        createdAt: new Date()
      });
  
      // Create income and expense entry
      await setDoc(doc(this.firestore, 'income-expense', user.uid), {
        income: [],
        expenses: []
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

  getUser(): User | null {
    return this.auth.currentUser;
  }
}

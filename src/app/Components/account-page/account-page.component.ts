import { Component, inject } from '@angular/core';
import {
  AuthService,
  CombinedUser,
} from '../../Services/Auth Service/auth-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { FirestoreService } from '../../Services/Firestore Service/firestore.service';

@Component({
  selector: 'app-account-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.css'],
})
export class AccountPageComponent {
  authService = inject(AuthService);
  firestoreService = inject(FirestoreService);

  userData$: Observable<CombinedUser | null> =
    this.authService.getCompleteUser();
  userData?: CombinedUser;
  editingField: string | null = null;
  updatedValue: any = '';
  savingsGoal: number = 0;

  ngOnInit() {
    // Subscribe here for side effects like calculating savingsGoal
    // or if you need the data imperatively in your methods.
    // The console.log here will still fire on every real-time update.
    this.userData$.subscribe((data) => {
      this.userData = data ?? undefined; // Update local copy for methods
      console.log(
        'Combined user data received (via real-time update):',
        this.userData
      );
    });
  }

  logout() {
    this.authService.logout();
  }
  darkMode = false;
}

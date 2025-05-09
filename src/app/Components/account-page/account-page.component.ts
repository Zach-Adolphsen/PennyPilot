import { Component, inject } from '@angular/core';
import { AuthService, CombinedUser } from '../../auth-service.service';
import { FirestoreService } from '../../firestore.service'; // Make sure this exists
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

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
    this.userData$.subscribe((data) => {
      this.userData = data ?? undefined; // Update local copy for methods
      console.log(
        'Combined user data received (via real-time update):',
        this.userData
      );
      if (this.userData) {
        this.calculateSavingsGoal();
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  // Start editing a specific field
  startEditing(field: string): void {
    this.editingField = field;
    this.updatedValue = this.userData
      ? this.userData[field as keyof CombinedUser]
      : '';
  }

  saveEdit(): void {
    if (this.editingField && this.updatedValue !== '') {
      console.log(`Saving ${this.editingField}:`, this.updatedValue);

      if (this.editingField === 'yearlyIncome') {
        const amount = parseFloat(this.updatedValue);
        if (isNaN(amount)) {
          console.error('Invalid amount entered.');
          return;
        }
        this.updatedValue = amount;
      }

      this.firestoreService
        .updateUserField(this.editingField, this.updatedValue)
        .subscribe({
          next: () => {
            console.log(`${this.editingField} updated successfully!`);
            this.editingField = null;
            this.updatedValue = '';
          },
          error: (error: any) => {
            console.error('Error updating field: ', error);
          },
        });
    }
  }

  calculateSavingsGoal(): void {
    if (
      this.userData &&
      typeof this.userData.yearlyIncome === 'number' &&
      this.userData.yearlyIncome >= 0
    ) {
      this.savingsGoal = this.userData.yearlyIncome * 0.5;
      console.log(`Savings goal calculated: $${this.savingsGoal}`);
    } else {
      console.error(
        'Yearly income is not defined or invalid in userData for savings goal calculation!'
      );
      this.savingsGoal = 0;
    }
  }
}

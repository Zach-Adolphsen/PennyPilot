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
    // this.authService.getCompleteUser().subscribe((data) => {
    //   this.userData = data ?? undefined;
    //   console.log('Combined user data:', this.userData);
    // });

    // Subscribe here for side effects like calculating savingsGoal
    // or if you need the data imperatively in your methods.
    // The console.log here will still fire on every real-time update.
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

  // Save the updated field to Firestore
  // saveEdit(): void {
  //   if (this.editingField && this.updatedValue !== '') {
  //     console.log(`Saving ${this.editingField}:`, this.updatedValue);

  //     // Validate the value (you can add custom validation here)
  //     if (this.editingField === 'yearlyIncome') {
  //       const amount = parseFloat(this.updatedValue);
  //       if (isNaN(amount)) {
  //         console.error('Invalid amount entered.');
  //         return;
  //       }
  //       this.updatedValue = amount; // Store valid amount
  //     }

  //     // Update Firestore with the new value
  //     this.firestoreService
  //       .updateUserField(this.editingField, this.updatedValue)
  //       .subscribe({
  //         next: () => {
  //           // Update the local userData object
  //           if (this.userData) {
  //             this.userData[this.editingField as keyof CombinedUser] =
  //               this.updatedValue;
  //             // If the field updated is 'yearlyIncome', recalculate the savings goal
  //             if (this.editingField === 'yearlyIncome') {
  //               this.calculateSavingsGoal(); // No arguments passed
  //             }
  //           }
  //           console.log(`${this.editingField} updated successfully!`);

  //           // Close editing mode and prevent further triggers
  //           this.editingField = null; // Close editing mode
  //           this.updatedValue = ''; // Reset updatedValue to avoid unnecessary re-renders
  //         },
  //         error: (error: any) => {
  //           console.error('Error updating field: ', error);
  //         },
  //       });
  //   }
  // }
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
            // No manual update of this.userData here.
            // The real-time listener in AuthService will automatically push
            // the updated data, which will then update this.userData (via the ngOnInit subscription)
            // and the template (via async pipe).
          },
          error: (error: any) => {
            console.error('Error updating field: ', error);
          },
        });
    }
  }

  // calculateSavingsGoal(): void {
  //   // Check if userData and yearlyIncome exist
  //   if (this.userData && this.userData.yearlyIncome != null) {
  //     // Calculate savings goal as 50% of yearly income
  //     this.savingsGoal = this.userData.yearlyIncome * 0.5;
  //     console.log(`Savings goal calculated: $${this.savingsGoal}`);
  //   } else {
  //     // Handle the case where yearlyIncome is not defined
  //     console.error('Yearly income is not defined in userData!');
  //     this.savingsGoal = 0; // Or handle it differently
  //   }
  // }
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

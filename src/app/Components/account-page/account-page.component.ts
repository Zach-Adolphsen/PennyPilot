import { Component, inject } from '@angular/core';
import { AuthService, CombinedUser } from '../../auth-service.service';
import { FirestoreService } from '../../firestore.service'; // Make sure this exists
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.css'],
})
export class AccountPageComponent {
  authService = inject(AuthService);
  firestoreService = inject(FirestoreService);

  userData?: CombinedUser;
  editingField: string | null = null;
  updatedValue: any = '';
  savingsGoal: number = 0;

  ngOnInit() {
    this.authService.getCompleteUser().subscribe((data) => {
      this.userData = data ?? undefined;
      console.log('Combined user data:', this.userData);
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
  saveEdit(): void {
    if (this.editingField && this.updatedValue !== '') {
      console.log(`Saving ${this.editingField}:`, this.updatedValue);

      // Validate the value (you can add custom validation here)
      if (this.editingField === 'yearlyIncome') {
        const amount = parseFloat(this.updatedValue);
        if (isNaN(amount)) {
          console.error('Invalid amount entered.');
          return;
        }
        this.updatedValue = amount; // Store valid amount
      }

      // Update Firestore with the new value
      this.firestoreService
        .updateUserField(this.editingField, this.updatedValue)
        .subscribe({
          next: () => {
            // Update the local userData object
            if (this.userData) {
              this.userData[this.editingField as keyof CombinedUser] =
                this.updatedValue;
              // If the field updated is 'yearlyIncome', recalculate the savings goal
              if (this.editingField === 'yearlyIncome') {
                this.calculateSavingsGoal(); // No arguments passed
              }
            }
            console.log(`${this.editingField} updated successfully!`);

            // Close editing mode and prevent further triggers
            this.editingField = null; // Close editing mode
            this.updatedValue = ''; // Reset updatedValue to avoid unnecessary re-renders
          },
          error: (error: any) => {
            console.error('Error updating field: ', error);
          },
        });
    }
  }

  calculateSavingsGoal(): void {
    // Check if userData and yearlyIncome exist
    if (this.userData && this.userData.yearlyIncome != null) {
      // Calculate savings goal as 50% of yearly income
      this.savingsGoal = this.userData.yearlyIncome * 0.5;
      console.log(`Savings goal calculated: $${this.savingsGoal}`);
    } else {
      // Handle the case where yearlyIncome is not defined
      console.error('Yearly income is not defined in userData!');
      this.savingsGoal = 0; // Or handle it differently
    }
  }
}

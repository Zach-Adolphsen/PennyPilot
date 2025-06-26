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

  isEditing: boolean = false;
  editingField: 'fname' | 'lname' | 'email' | null = null;
  currentValue: string = ''; // Holds the value of the field being edited
  originalValue: string = ''; // Stores the original value for cancellation

  logout(): void {
    this.authService.logout();
  }

  editField(
    field: 'fname' | 'lname' | 'email',
    value: string | null | undefined
  ): void {
    this.isEditing = true;
    this.editingField = field;
    this.currentValue = value || ''; // Ensure it's always a string
    this.originalValue = value || ''; // Store original value
  }

  saveField(): void {
    if (!this.editingField) return;

    // Get the new value from `currentValue`
    const newValue = this.currentValue;

    this.firestoreService
      .updateUserField(this.editingField, newValue)
      .subscribe({
        next: () => {
          console.log(`${this.editingField} updated successfully!`);
          this.resetEditingState();
        },
        error: (err) => {
          console.error(`Error updating ${this.editingField}:`, err);
          // Optionally revert to original value on error, though relying on observable re-emission is often better
          this.resetEditingState();
        },
      });
  }

  cancelEdit(): void {
    this.resetEditingState();
  }

  private resetEditingState(): void {
    this.isEditing = false;
    this.editingField = null;
    this.currentValue = '';
    this.originalValue = '';
  }
}

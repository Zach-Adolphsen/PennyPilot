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

  editingUser: CombinedUser | null = null;
  editingField: string | null = null;
  isEditing: boolean = false;

  logout(): void {
    this.authService.logout();
  }

  editField(userField: string): void {
    this.isEditing = true;
    this.editingField = userField;
  }

  saveField(): void {}
}

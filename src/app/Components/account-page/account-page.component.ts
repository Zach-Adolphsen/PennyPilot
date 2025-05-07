import { Component, inject } from '@angular/core';
import { AuthService, CombinedUser } from '../../auth-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-page',
  imports: [CommonModule],
  templateUrl: './account-page.component.html',
  styleUrl: './account-page.component.css',
})
export class AccountPageComponent {
  authService = inject(AuthService);

  userData?: CombinedUser;

  ngOnInit() {
    this.authService.getCompleteUser().subscribe((data) => {
      this.userData = data ?? undefined;
      console.log('Combined user data:', this.userData);
    });
  }
}

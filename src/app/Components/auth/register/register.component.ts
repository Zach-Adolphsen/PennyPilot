import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AuthService,
  UserInfo,
} from '../../../Services/Auth Service/auth-service.service';
import { catchError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  userAccountRegister!: FormGroup<{
    fName: FormControl<string>;
    lName: FormControl<string>;
    email: FormControl<string>;
    password: FormControl<string>;
  }>;

  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  ngOnInit(): void {
    this.userAccountRegister = this.formBuilder.group<{
      fName: FormControl<string>;
      lName: FormControl<string>;
      email: FormControl<string>;
      password: FormControl<string>;
    }>({
      fName: this.formBuilder.control<string>('', {
        validators: Validators.required,
        nonNullable: true,
      }),
      lName: this.formBuilder.control<string>('', {
        validators: Validators.required,
        nonNullable: true,
      }),
      email: this.formBuilder.control<string>('', {
        validators: Validators.required,
        nonNullable: true,
      }),
      password: this.formBuilder.control<string>('', {
        validators: Validators.required,
        nonNullable: true,
      }),
    });
  }

  register() {
    if (this.userAccountRegister.get('fName')?.value === '') {
      alert('Please enter your first name');
      return;
    }
    if (this.userAccountRegister.get('lName')?.value === '') {
      alert('Please enter your Last name');
      return;
    }

    if (this.userAccountRegister.get('email')?.value === '') {
      alert('Please enter email');
      return;
    }

    if (this.userAccountRegister.get('password')?.value === '') {
      alert('Please enter your password');
      return;
    }

    const user: UserInfo = {
      fName: this.userAccountRegister.get('fName')?.value ?? 'null',
      lName: this.userAccountRegister.get('lName')?.value ?? 'null',
      email: this.userAccountRegister.get('email')?.value ?? '',
      password: this.userAccountRegister.get('password')?.value ?? '',
    };

    this.authService.register(user);

    console.log('User data being registered:', user); // used for testing

    this.userAccountRegister.reset(); // clear form

    // this.router.navigate(['/login']); // redirect user to login page
  }
}

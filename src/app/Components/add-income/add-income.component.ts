import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { IncomeService } from '../../Services/Income Service/income.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Income } from '../../Interfaces/income';
import { AuthService } from '../../Services/Auth Service/auth-service.service';
import { Observable, Subscription } from 'rxjs';
import { TotalIncomeService } from '../../Services/Total-Income Service/total-income.service';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp

// Custom validator function for four-digit year
function fourDigitYearValidator(
  control: FormControl
): { [key: string]: any } | null {
  const value = control.value;
  if (value && typeof value === 'string') {
    const yearPart = value.substring(0, 4); // Assuming format YYYY-MM-DD
    if (yearPart.length !== 4 || isNaN(parseInt(yearPart, 10))) {
      return { fourDigitYear: true };
    }
  }
  return null;
}

@Component({
  selector: 'app-add-income',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './add-income.component.html',
  styleUrl: './add-income.component.css',
})
export class AddIncomeComponent implements OnInit {
  private incomeService = inject(IncomeService);
  private authService = inject(AuthService);
  private totalIncomeService = inject(TotalIncomeService);

  incomeForm!: FormGroup<{
    id: FormControl<string | null>;
    date: FormControl<string | null>;
    source: FormControl<string | null>;
    amount: FormControl<number | null>;
  }>;

  constructor(private fb: FormBuilder) {}
  totalIncome: number = 0;
  totalIncomeSubscription: Subscription | undefined;

  ngOnInit(): void {
    this.incomeForm = this.fb.group<{
      id: FormControl<string | null>;
      date: FormControl<string | null>;
      source: FormControl<string | null>;
      amount: FormControl<number | null>;
    }>({
      id: this.fb.control(''),
      date: this.fb.control('', [Validators.required, fourDigitYearValidator]),
      source: this.fb.control('', Validators.required),
      amount: this.fb.control(null, [
        Validators.required,
        Validators.min(0.01),
      ]),
    });

    this.incomeService.getTotalIncome().subscribe((total) => {
      this.totalIncomeService.setInitialTotal(total);
    });

    this.totalIncomeSubscription =
      this.totalIncomeService.totalIncome$.subscribe((total) => {
        this.totalIncome = total;
      });
  }

  ngOnDestroy(): void {
    if (this.totalIncomeSubscription) {
      this.totalIncomeSubscription.unsubscribe();
    }
  }

  private markAllAsTouched(): void {
    Object.values(this.incomeForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  onAddIncome() {
    const dateString = this.incomeForm.controls.date.value!;
    const [year, month, day] = dateString.split('-').map(Number);
    if (this.incomeForm.valid) {
      const newIncome: Income = {
        id: '', // Firestore will generate the ID
        date: Timestamp.fromDate(new Date(year, month - 1, day)).toDate(), // Save as Date
        source: this.incomeForm.controls.source.value!,
        amount: this.incomeForm.controls.amount.value!,
      };

      this.incomeService.addIncome(newIncome).subscribe({
        next: (newId) => {
          this.incomeForm.reset();
        },
        error: (error) => {
          console.error('Error adding income:', error);
        },
      });
    } else {
      this.markAllAsTouched();
    }
  }
}

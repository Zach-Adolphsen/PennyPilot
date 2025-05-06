import { Component, inject } from '@angular/core';
import { IncomeService } from '../../Services/Income Service/income.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Income } from '../../income';
import { AuthService } from '../../auth-service.service';

// Custom validator function for four-digit year
function fourDigitYearValidator(
  control: FormControl
): { [key: string]: any } | null {
  const value = control.value;
  if (value && typeof value === 'string') {
    const yearPart = value.substring(0, 4); // Assuming YYYY-MM-DD format
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
export class AddIncomeComponent {
  private incomeService = inject(IncomeService);
  private authService = inject(AuthService);

  incomeForm!: FormGroup<{
    // id: FormControl<string | null>;
    date: FormControl<string | null>;
    source: FormControl<string | null>;
    amount: FormControl<number | null>;
  }>;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.incomeForm = this.fb.group<{
      // id: FormControl<string | null>;
      date: FormControl<string | null>;
      source: FormControl<string | null>;
      amount: FormControl<number | null>;
    }>({
      // id: this.fb.control('', Validators.required),
      date: this.fb.control('', [Validators.required, fourDigitYearValidator]), // Apply the custom validator
      source: this.fb.control('', Validators.required),
      amount: this.fb.control(null, [
        Validators.required,
        Validators.min(0.01),
      ]),
    });
  }

  private markAllAsTouched(): void {
    Object.values(this.incomeForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  onAddIncome() {
    if (this.incomeForm.valid) {
      const newIncome: Income = {
        id: '', // Firestore will generate the ID
        date: new Date(this.incomeForm.controls.date.value!),
        source: this.incomeForm.controls.source.value!,
        amount: this.incomeForm.controls.amount.value!,
      };

      this.incomeService.addIncome(newIncome).subscribe({
        next: (newId) => {
          console.log('Income added with ID:', newId);
          this.incomeForm.reset();
          // Optionally, update your local income list if you're displaying it elsewhere
        },
        error: (error) => {
          console.error('Error adding income:', error);
          // Handle the error appropriately (e.g., display an error message)
        },
      });
    } else {
      this.markAllAsTouched();
    }
  }
}

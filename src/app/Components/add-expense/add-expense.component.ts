import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Expense } from '../../Interfaces/expense';
import { AuthService } from '../../Services/Auth Service/auth-service.service';
import { ExpenseService } from '../../Services/Expense Service/expense.service';
import { Timestamp } from 'firebase/firestore';

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
  selector: 'app-add-expense',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.css',
})
export class AddExpenseComponent {
  private expenseService = inject(ExpenseService);
  private authService = inject(AuthService);

  expenseForm!: FormGroup<{
    id: FormControl<string | null>;
    date: FormControl<string | null>;
    source: FormControl<string | null>;
    amount: FormControl<number | null>;
  }>;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.expenseForm = this.fb.group<{
      id: FormControl<string | null>;
      date: FormControl<string | null>;
      source: FormControl<string | null>;
      amount: FormControl<number | null>;
    }>({
      id: this.fb.control(''), // Removed Validators.required
      date: this.fb.control('', [Validators.required, fourDigitYearValidator]), // Apply the custom validator
      source: this.fb.control('', Validators.required),
      amount: this.fb.control(null, [
        Validators.required,
        Validators.min(0.01),
      ]),
    });
  }

  private markAllAsTouched(): void {
    Object.values(this.expenseForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  onAddExpense() {
    const dateString = this.expenseForm.controls.date.value!;
    const [year, month, day] = dateString.split('-').map(Number);
    if (this.expenseForm.valid) {
      const newExpense: Expense = {
        id: '', // Firestore will generate the ID
        // date: new Date(year, month - 1, day),
        date: Timestamp.fromDate(new Date(year, month - 1, day)).toDate(), // Save as Date
        source: this.expenseForm.controls.source.value!,
        amount: this.expenseForm.controls.amount.value!,
      };

      this.expenseService.addExpense(newExpense).subscribe({
        next: (newId) => {
          this.expenseForm.reset();
        },
        error: (error) => {
          console.error('Error adding expense:', error);
        },
      });
    } else {
      this.markAllAsTouched();
    }
  }
}


import { Component, inject, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { RouterLink, RouterModule } from '@angular/router';
import { IncomeService } from '../../Services/Income Service/income.service';
import { ExpenseService } from '../../Services/Expense Service/expense.service';
import { Expense } from '../../expense';
import { Income } from '../../income';
import { CommonModule } from '@angular/common';
import { MoneySavedComponent } from '../money-saved/money-saved.component';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-dashboard',
  imports: [
    RouterModule,
    RouterLink,
    NgChartsModule,
    CommonModule,
    MoneySavedComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})

export class DashboardComponent implements OnInit {
  private IncomeService = inject(IncomeService);
  private ExpenseService = inject(ExpenseService);
  currentDate: string = '';
  monthlyIncome: number = 0;
  monthlyExpense: number = 0;
  finalFunds: number = 0;

  recentIncomes: Income[] = [];
  recentExpenses: Expense[] = [];


  pieChartData: ChartData<'pie', number[]> = {
    labels: ['Rent', 'Groceries', 'Fun'],
    datasets: [
      {

        data: [450, 300, 200],

        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },

  };

  barChartData: ChartData<'bar'> = {
    labels: ['March', 'April', 'May'],
    datasets: [
      {
        label: 'Income',
        data: [8333.33, 8749.77, 0], // May will be updated dynamically
        backgroundColor: '#42A5F5',
      },
      {
        label: 'Expenses',
        data: [4130.66, 4388.12, 350], // optionally dynamic later
        backgroundColor: '#FFA726',
      },
    ],
  };


  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },

    },
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };
  loadRecentData(): void {
    this.IncomeService.getRecentIncomes(3).subscribe((income) => {
      this.recentIncomes = income;
      console.log('Incomes:', income); // ✅ Debug log
      if (income.length === 0) console.warn('⚠️ No incomes returned');
    });

    this.ExpenseService.getRecentExpenses(3).subscribe((expenses) => {
      this.recentExpenses = expenses;
      console.log('Expenses:', expenses); // ✅ Debug log
    });
  }
  ngOnInit(): void {
    this.currentDate = new Date().toLocaleDateString();
    this.IncomeService.getMonthlyIncome().subscribe((income) => {
      this.monthlyIncome = income;
      console.log(income);
      this.barChartData.datasets[0].data[2] = income;
    });
    this.loadRecentData();
    this.ExpenseService.getMonthlyExpense().subscribe((expense) => {
      this.monthlyExpense = expense;
      console.log(expense);
    });
    this.calculateFinalFunds();
  }

  calculateFinalFunds(): void {
    // Use forkJoin to wait for both income and expense observables to emit
    forkJoin({
      income: this.IncomeService.getMonthlyIncome(),
      expense: this.ExpenseService.getMonthlyExpense()
    }).subscribe(
      ({ income, expense }) => {
        // Calculate final funds after both values are retrieved
        this.finalFunds = income - expense;
        console.log(`Final funds after expenses: $${this.finalFunds}`);
      },
      (error) => {
        console.error('Error fetching income or expense:', error);
      }
    );
  }

}

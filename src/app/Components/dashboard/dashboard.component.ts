import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { RouterLink, RouterModule } from '@angular/router';
import { IncomeService } from '../../Services/Income Service/income.service';
import { ExpenseService } from '../../Services/Expense Service/expense.service';
import { Expense } from '../../Interfaces/expense';
import { Income } from '../../Interfaces/income';
import { CommonModule } from '@angular/common';
import { MoneySavedComponent } from '../money-saved/money-saved.component';
import { forkJoin } from 'rxjs';
import { BarChartService } from '../../Services/Charts/bar-chart.service';

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
  /*
    Services
  */
  private IncomeService = inject(IncomeService);
  private ExpenseService = inject(ExpenseService);
  private BarChartService = inject(BarChartService);

  currentDate: string = '';
  monthlyIncome: number = 0;
  monthlyExpense: number = 0;
  finalFunds: number = 0;
  currentMonthName: string = '';

  recentIncomes: Income[] = [];
  recentExpenses: Expense[] = [];

  @ViewChild('barChart') barChartRef: any;

  pieChartData: ChartData<'pie', number[]> = {
    labels: ['Necessities', 'Wants', 'Savings'],
    datasets: [
      {
        data: [50, 30, 20],
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

  barChartData = this.BarChartService.barChartData;
  barChartOptions = this.BarChartService.barChartOptions;

  ngOnInit(): void {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Adding 1 since getMonth() returns 0-11
    const currentYear = currentDate.getFullYear();

    console.log(`Querying for month: ${currentMonth}, year: ${currentYear}`);

    this.IncomeService.getMonthlyIncome(currentDate).subscribe({
      next: (total) => console.log('Monthly total:', total),
      error: (error) => console.error('Error getting income:', error),
    });

    this.BarChartService.updateBarChartData();

    this.BarChartService.updateBarChartLabels();

    this.currentDate = new Date().toLocaleDateString('default', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    });

    this.currentMonthName = new Date().toLocaleString('default', {
      month: 'long',
    });

    this.IncomeService.getMonthlyIncome(currentDate).subscribe((income) => {
      this.monthlyIncome = income;
      this.BarChartService.updateBarChartData();
    });

    this.ExpenseService.getMonthlyExpense(currentDate).subscribe((expense) => {
      this.monthlyExpense = expense;
      this.BarChartService.updateBarChartData();
    });

    this.LoadRecentFinancialData();
    this.calculateFinalFunds();
  }

  LoadRecentFinancialData(): void {
    this.IncomeService.getRecentIncomes().subscribe((income) => {
      this.recentIncomes = income;
    });

    this.ExpenseService.getRecentExpenses().subscribe((expenses) => {
      this.recentExpenses = expenses;
    });
  }

  calculateFinalFunds(): void {
    const currentDate = new Date();
    forkJoin({
      income: this.IncomeService.getMonthlyIncome(currentDate),
      expense: this.ExpenseService.getMonthlyExpense(currentDate),
    }).subscribe(
      ({ income, expense }) => {
        this.finalFunds = income - expense;
        console.log(`Final funds after expenses: $${this.finalFunds}`);
      },
      (error) => {
        console.error('Error fetching income or expense:', error);
      }
    );
  }
}

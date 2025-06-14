import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { RouterLink, RouterModule } from '@angular/router';
import { IncomeService } from '../../Services/Income Service/income.service';
import { ExpenseService } from '../../Services/Expense Service/expense.service';
import { Expense } from '../../Interfaces/expense';
import { Income } from '../../Interfaces/income';
import { CommonModule, Time } from '@angular/common';
import { MoneySavedComponent } from '../money-saved/money-saved.component';
import { forkJoin } from 'rxjs';
import { Timestamp } from 'firebase/firestore';
import { BarChartService } from '../../Services/Bar Chart/bar-chart.service';

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
  private BarChartService = inject(BarChartService);

  currentDate: string = '';
  monthlyIncome: number = 0;
  monthlyExpense: number = 0;
  finalFunds: number = 0;

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
  currentMonthName: string = '';

  ngOnInit(): void {
    this.BarChartService.updateBarChartData();

    this.BarChartService.updateBarChartLabels();

    this.currentDate = new Date().toLocaleDateString();

    const today = new Date();

    this.currentMonthName = today.toLocaleString('default', { month: 'long' });

    this.IncomeService.getMonthlyIncome().subscribe((income) => {
      this.monthlyIncome = income;
      this.BarChartService.updateBarChartData();
    });

    this.ExpenseService.getMonthlyExpense().subscribe((expense) => {
      this.monthlyExpense = expense;
      this.BarChartService.updateBarChartData();
    });

    this.loadRecentData();
    this.calculateFinalFunds();
  }

  loadRecentData(): void {
    this.IncomeService.getRecentIncomes(3).subscribe((income) => {
      this.recentIncomes = income;
    });

    this.ExpenseService.getRecentExpenses(3).subscribe((expenses) => {
      this.recentExpenses = expenses;
    });
  }

  calculateFinalFunds(): void {
    forkJoin({
      income: this.IncomeService.getMonthlyIncome(),
      expense: this.ExpenseService.getMonthlyExpense(),
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

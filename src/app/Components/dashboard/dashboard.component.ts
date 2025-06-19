import { Component, inject, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { RouterLink, RouterModule } from '@angular/router';
import { IncomeService } from '../../Services/Income Service/income.service';
import { ExpenseService } from '../../Services/Expense Service/expense.service';
import { Expense } from '../../Interfaces/expense';
import { Income } from '../../Interfaces/income';
import { CommonModule } from '@angular/common';
import { MoneySavedComponent } from '../money-saved/money-saved.component';
import { forkJoin, Subscription } from 'rxjs';
import { BarChartService } from '../../Services/Charts/bar-chart.service';
import { BaseChartDirective } from 'ng2-charts';

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
export class DashboardComponent implements OnInit, OnDestroy {
  /*
    Services
  */
  private IncomeService = inject(IncomeService);
  private ExpenseService = inject(ExpenseService);
  private BarChartService = inject(BarChartService);

  monthlyIncome: number = 0;
  monthlyExpense: number = 0;
  finalFunds: number = 0;

  recentIncomes: Income[] = [];
  recentExpenses: Expense[] = [];

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  private chartUpdateSubscription?: Subscription;

  currentDate: string = '';
  currentMonthName: string = '';

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

    this.currentDate = new Date().toLocaleDateString('default', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    });

    this.currentMonthName = new Date().toLocaleString('default', {
      month: 'long',
    });

    this.BarChartService.updateBarChartData();

    // Subscribe to notifications from BarChartService to update the chart view
    this.chartUpdateSubscription =
      this.BarChartService.barChartDataUpdated$.subscribe(() => {
        this.barChartData = {
          ...this.BarChartService.barChartData,
          datasets: [
            ...this.BarChartService.barChartData.datasets.map((ds) => ({
              ...ds,
              data: [...(ds.data || [])],
            })),
          ],
          labels: [...(this.BarChartService.barChartData.labels || [])],
        };

        if (this.chart) {
          this.chart.update();
        }
      });

    // Fetch monthly income for dashboard display
    this.IncomeService.getMonthlyIncome(
      currentDate.getMonth(),
      currentDate.getFullYear()
    ).subscribe((income) => {
      this.monthlyIncome = income;
      this.calculateFinalFunds();
    });

    // Fetch monthly expense for dashboard display
    this.ExpenseService.getMonthlyExpense(
      currentDate.getMonth(),
      currentDate.getFullYear()
    ).subscribe((expense) => {
      this.monthlyExpense = expense;
      this.calculateFinalFunds();
    });

    this.LoadRecentFinancialData();
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
    if (
      typeof this.monthlyIncome === 'number' &&
      typeof this.monthlyExpense === 'number'
    ) {
      this.finalFunds = this.monthlyIncome - this.monthlyExpense;
    }
  }

  ngOnDestroy(): void {
    if (this.chartUpdateSubscription) {
      this.chartUpdateSubscription.unsubscribe();
    }
  }
}

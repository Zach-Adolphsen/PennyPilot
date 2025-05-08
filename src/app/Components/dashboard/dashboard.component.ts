
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { TotalIncomeService } from '../../Services/Total-Income Service/total-income.service';
import { IncomeService } from '../../Services/Income Service/income.service';
import { Subscription } from 'rxjs';
import { TotalExpenseService } from '../../Services/Total-Expense Service/total-expense.service';
import { ExpenseService } from '../../Services/Expense Service/expense.service';


@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, RouterLink, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})

export class DashboardComponent implements OnInit, OnDestroy {
  totalIncome: number = 0;
  totalIncomeSubscription: Subscription | undefined;

  totalExpense: number = 0;
  totalExpenseSubscription: Subscription | undefined;


  pieChartData: ChartData<'pie', number[]> = {
    labels: ['Rent', 'Groceries', 'Fun'],
    datasets: [
      {
        data: [100, 300, 200],
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
    labels: ['Income vs Expenses'],
    datasets: [
      {
        label: 'Income',
        data: [this.totalIncome],
        backgroundColor: '#42A5F5',
      },
      {
        label: 'Expenses',
        data: [this.totalExpense],
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

  constructor(
    private totalIncomeService: TotalIncomeService,
    private incomeService: IncomeService,
    private totalExpenseService: TotalExpenseService,
    private expenseService: ExpenseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.totalIncomeSubscription = this.totalIncomeService.totalIncome$.subscribe(
      (total) => {
        this.totalIncome = total;
        this.updateBarChartData();
      }
    );

    this.incomeService.getTotalIncome().subscribe((initialTotal) => {
      this.totalIncomeService.setInitialTotal(initialTotal);
    });

    this.totalExpenseSubscription = this.totalExpenseService.totalExpense$.subscribe(
      (total) => {
        console.log('Total Expense Received:', total);
        this.totalExpense = total;
        this.updateBarChartData();
      }
    );

    this.expenseService.getTotalExpense().subscribe((initialTotal) => {
      this.totalExpenseService.setInitialTotal(initialTotal);
    });
  }

  ngOnDestroy(): void {
    if (this.totalIncomeSubscription) {
      this.totalIncomeSubscription.unsubscribe();
    }

    if (this.totalExpenseSubscription) {
      this.totalExpenseSubscription.unsubscribe();
    }
  }


  updateBarChartData(): void {
    this.barChartData = {
      ...this.barChartData,
      datasets: [
        { ...this.barChartData.datasets[0], data: [this.totalIncome] },
        { ...this.barChartData.datasets[1], data: [this.totalExpense] },
      ],
    };
    this.cdr.detectChanges();
  }


}

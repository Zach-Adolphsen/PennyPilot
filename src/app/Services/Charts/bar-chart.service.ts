import { inject, Injectable } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { IncomeService } from '../Income Service/income.service';
import { ExpenseService } from '../Expense Service/expense.service';
import { forkJoin, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BarChartService {
  private incomeService = inject(IncomeService);
  private expenseService = inject(ExpenseService);

  barChartData!: ChartData<'bar'>;

  private barChartDataUpdated = new Subject<void>();
  public barChartDataUpdated$ = this.barChartDataUpdated.asObservable();

  constructor() {
    this.initializeChartStructure();
  }

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

  private getMonthName(monthIndex: number, year: number): string {
    const date = new Date(year, monthIndex, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  private initializeChartStructure(): void {
    const d0 = new Date(); // Current month
    const d1 = new Date(d0);
    d1.setMonth(d0.getMonth() - 1); // 1 month ago
    const d2 = new Date(d0);
    d2.setMonth(d0.getMonth() - 2); // 2 months ago

    const label2 = this.getMonthName(d2.getMonth(), d2.getFullYear());
    const label1 = this.getMonthName(d1.getMonth(), d1.getFullYear());
    const label0 = this.getMonthName(d0.getMonth(), d0.getFullYear());

    this.barChartData = {
      labels: [label2, label1, label0], // Order: month-2, month-1, current month
      datasets: [
        {
          label: 'Income',
          data: [0, 0, 0], // Initialize with zeros
          backgroundColor: '#42A5F5',
        },
        {
          label: 'Expenses',
          data: [0, 0, 0], // Initialize with zeros
          backgroundColor: '#FFA726',
        },
      ],
    };
  }

  // This method might be redundant if labels are always for the last 3 months.
  // updateBarChartData now handles refreshing labels.
  updateBarChartLabels(): void {
    if (
      this.barChartData &&
      this.barChartData.labels &&
      this.barChartData.datasets &&
      this.barChartData.datasets.length >= 2
    ) {
      const d0 = new Date();
      const currentMonthLabel = this.getMonthName(
        d0.getMonth(),
        d0.getFullYear()
      );

      // If the last label is not the current month, re-initialize.
      // This handles the case where the app runs across a month boundary.
      if (
        this.barChartData.labels[this.barChartData.labels.length - 1] !==
        currentMonthLabel
      ) {
        this.initializeChartStructure();
      }
    }
  }

  updateBarChartData(): void {

    if (
      this.barChartData &&
      this.barChartData.labels &&
      this.barChartData.datasets &&
      this.barChartData.datasets.length >= 2
    ) {
      const incomeDataset = this.barChartData.datasets.find(
        (dataset) => dataset.label === 'Income'
      );
      const expenseDataset = this.barChartData.datasets.find(
        (dataset) => dataset.label === 'Expenses'
      );

      if (!incomeDataset || !expenseDataset) {
        console.error('Income or Expense dataset not found in barChartData');
        return;
      }

      const d0 = new Date(); // Current month
      const d1 = new Date(d0);
      d1.setMonth(d0.getMonth() - 1); // 1 month ago
      const d2 = new Date(d0);
      d2.setMonth(d0.getMonth() - 2); // 2 months ago

      // Ensure labels are current
      const label2 = this.getMonthName(d2.getMonth(), d2.getFullYear());
      const label1 = this.getMonthName(d1.getMonth(), d1.getFullYear());
      const label0 = this.getMonthName(d0.getMonth(), d0.getFullYear());

      if (this.barChartData.labels) {
        this.barChartData.labels[0] = label2;
        this.barChartData.labels[1] = label1;
        this.barChartData.labels[2] = label0;
      } else {
        this.barChartData.labels = [label2, label1, label0];
      }

      const incomeObservables: Observable<number>[] = [
        this.incomeService.getMonthlyIncome(d2.getMonth(), d2.getFullYear()),
        this.incomeService.getMonthlyIncome(d1.getMonth(), d1.getFullYear()),
        this.incomeService.getMonthlyIncome(d0.getMonth(), d0.getFullYear()),
      ];

      const expenseObservables: Observable<number>[] = [
        this.expenseService.getMonthlyExpense(d2.getMonth(), d2.getFullYear()),
        this.expenseService.getMonthlyExpense(d1.getMonth(), d1.getFullYear()),
        this.expenseService.getMonthlyExpense(d0.getMonth(), d0.getFullYear()),
      ];

      forkJoin({
        incomes: forkJoin(incomeObservables),
        expenses: forkJoin(expenseObservables),
      }).subscribe({
        next: ({ incomes, expenses }) => {
          // Data is ordered: [month-2, month-1, current month]
          // Assign new array references to help change detection
          incomeDataset.data = [...incomes];
          expenseDataset.data = [...expenses];

          // Notify subscribers that data has been internally updated
          this.barChartDataUpdated.next();
        },
        error: (err) => {
          console.error('BarChartService: Error fetching chart data:', err);
        },
      });
    }
  }
}

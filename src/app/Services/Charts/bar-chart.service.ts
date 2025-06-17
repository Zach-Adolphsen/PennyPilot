import { inject, Injectable } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { IncomeService } from '../Income Service/income.service';
import { ExpenseService } from '../Expense Service/expense.service';

@Injectable({
  providedIn: 'root',
})
export class BarChartService {
  private incomeService = inject(IncomeService);
  private expenseService = inject(ExpenseService);

  constructor() {}

  pastMonthName2: string = this.getMonthName(this.getCurrentMonth() - 1);
  pastMonthName1: string = this.getMonthName(this.getCurrentMonth());
  currentMonthName: string = this.getMonthName(this.getCurrentMonth() + 1);

  private getCurrentMonth(): number {
    const date: Date = new Date();
    return date.getUTCMonth();
  }

  private getMonthName(currentMonth: number): string {
    const date = new Date();
    date.setMonth(currentMonth - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
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

  barChartData: ChartData<'bar'> = {
    labels: [this.pastMonthName2, this.pastMonthName1, this.currentMonthName],
    datasets: [
      {
        label: 'Income',
        data: [
          0,
          0,
          0, // Placeholder, will be updated dynamically
        ],
        backgroundColor: '#42A5F5',
      },
      {
        label: 'Expenses',
        data: [0, 0, 0], // Current month will be updated dynamically
        backgroundColor: '#FFA726',
      },
    ],
  };

  currentMonthIndex = (this.barChartData.labels ?? []).indexOf(
    this.currentMonthName
  );

  updateBarChartLabels(): void {
    if (
      this.barChartData &&
      this.barChartData.labels &&
      this.barChartData.datasets &&
      this.barChartData.datasets.length >= 2
    ) {
      if (this.currentMonthIndex === -1) {
        this.barChartData.labels.push(this.currentMonthName);
        if (this.barChartData.labels.length > 3) {
          this.barChartData.labels.shift();
          if (
            this.barChartData.datasets[0] &&
            this.barChartData.datasets[0].data
          ) {
            this.barChartData.datasets[0].data.shift();
          }
          if (
            this.barChartData.datasets[1] &&
            this.barChartData.datasets[1].data
          ) {
            this.barChartData.datasets[1].data.shift();
          }
        } else {
          if (
            this.barChartData.datasets[0] &&
            this.barChartData.datasets[0].data
          ) {
            this.barChartData.datasets[0].data.push(0);
          }
          if (
            this.barChartData.datasets[1] &&
            this.barChartData.datasets[1].data
          ) {
            this.barChartData.datasets[1].data.push(0);
          }
        }
      }
    }
  }

  updateBarChartData(): void {
    const currentDate = new Date();

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

      if (incomeDataset?.data && this.currentMonthIndex !== -1) {
        this.incomeService.getMonthlyIncome(currentDate).subscribe((income) => {
          incomeDataset.data[this.currentMonthIndex] = income;
        });
      }

      if (expenseDataset?.data && this.currentMonthIndex !== -1) {
        this.expenseService
          .getMonthlyExpense(currentDate)
          .subscribe((expense) => {
            expenseDataset.data[this.currentMonthIndex] = expense;
          });
      }
    }
  }
}

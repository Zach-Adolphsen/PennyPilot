import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { TotalIncomeService } from '../../Services/Total-Income Service/total-income.service';
import { IncomeService } from '../../Services/Income Service/income.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, RouterLink, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  totalIncome: number = 0;
  totalIncomeSubscription: Subscription | undefined;

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
    labels: ['Total Income'], // Modified label
    datasets: [
      {
        label: 'Income',
        data: [this.totalIncome], // Use the totalIncome here
        backgroundColor: '#42A5F5',
      },
      {
        label: 'Expenses',
        data: [300], // Example expense data
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

  constructor(private totalIncomeService: TotalIncomeService, private incomeService: IncomeService) {}

  ngOnInit(): void {
    this.totalIncomeSubscription = this.totalIncomeService.totalIncome$.subscribe(
      (total) => {
        this.totalIncome = total;
        this.updateBarChartData(); // Update the bar chart when total income changes
      }
    );

    // Optionally, fetch the initial total income if needed on component load
    this.incomeService.getTotalIncome().subscribe((initialTotal) => {
      this.totalIncomeService.setInitialTotal(initialTotal);
    });
  }

  ngOnDestroy(): void {
    if (this.totalIncomeSubscription) {
      this.totalIncomeSubscription.unsubscribe();
    }
  }

  updateBarChartData(): void {
    this.barChartData.datasets[0].data = [this.totalIncome];
    // You might need to trigger a chart update if your charting library requires it
  }
}
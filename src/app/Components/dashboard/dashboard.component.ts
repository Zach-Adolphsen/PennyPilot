import { Component } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';


@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, RouterLink, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  
  pieChartData: ChartData<'pie', number[]> = {
    labels: ['Rent', 'Groceries', 'Fun'],
    datasets: [
      {
        data: [450, 300, 200],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }
    ]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };
}

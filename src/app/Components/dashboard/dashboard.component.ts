import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { ExpenseService } from '../../Services/Expense Service/expense.service';
import { Expense } from '../../expense';
import { inject } from '@angular/core';
import { IncomeService } from '../../Services/Income Service/income.service';
import { Income } from '../../income';
import { TotalIncomeService } from '../../Services/Total-Income Service/total-income.service';


@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, RouterLink, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {

private incomeService = inject(IncomeService);
 private expenseService = inject(ExpenseService);
//  private TotalIncome = inject(TotalIncomeService);

  // totalIncome: number = 0;

  expense: Expense = { id: '', date: new Date(), source: '', amount: 0};
 income: Income = {id: '', date: new Date(), source: '', amount: 0};

 incomes: Income[] = [];
  expenses: Expense[] = [];

  ngOnInit() {
    this.expenseService.getExpenseList().subscribe(expense => this.expenses = expense);
    // this.TotalIncome.totalIncome$.subscribe(total => this.totalIncome = total);
   this.incomeService.getIncomeList().subscribe(income => this.incomes = income);

  }

//   ngOnInitTotal() {
//     this.TotalIncome.totalIncome$.subscribe(total => this.totalIncome = total);  
    
//     }


// ngOnInitIncome() {
//     this.incomeService.getIncomeList().subscribe(income => this.incomes = income);

//     }

  







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

  // Bar Chart Data
barChartData: ChartData<'bar'> = {
  labels: ['January', 'February', 'March'],
  datasets: [
    {
      label: 'Income',
      data: [500, 700, 600],
      backgroundColor: '#42A5F5'
    },
    {
      label: 'Expenses',
      data: [300, 400, 350],
      backgroundColor: '#FFA726'
    }
  ]
};

// Bar Chart Options
barChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  scales: {
    y: {
      beginAtZero: true
    }
  },
  plugins: {
    legend: {
      position: 'top',
    }
  }
};


}

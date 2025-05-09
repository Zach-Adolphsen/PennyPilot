
import { Component, inject, OnInit, ViewChild } from '@angular/core';
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
  currentMonthName: string = '';

  recentIncomes: Income[] = [];
  recentExpenses: Expense[] = [];

  @ViewChild('barChart') barChartRef: any;

  pieChartData: ChartData<'pie', number[]> = {
    labels: ['Necesities', 'Wants', 'Savings'],
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

  barChartData: ChartData<'bar'> = {
    labels: ['March', 'April', 'May'],
    datasets: [
      {
        label: 'Income',
        data: [8333.33, 8749.77, 0], // Current month will be updated dynamically
        backgroundColor: '#42A5F5',
      },
      {
        label: 'Expenses',
        data: [4130.66, 4388.12, 0], // Current month will be updated dynamically
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


      console.log('Incomes:', income); // Debug log
      if (income.length === 0) console.warn('No incomes returned');
    });

    this.ExpenseService.getRecentExpenses(3).subscribe((expenses) => {
      this.recentExpenses = expenses;
      console.log('Expenses:', expenses); // Debug log
    });
  }

  ngOnInit(): void {
    this.currentDate = new Date().toLocaleDateString();
    const today = new Date();
    this.currentMonthName = today.toLocaleString('default', { month: 'long' });
    console.log('ngOnInit - currentMonthName:', this.currentMonthName);
    this.updateBarChartLabels();
    console.log('ngOnInit - barChartData after labels:', this.barChartData);

    this.IncomeService.getMonthlyIncome().subscribe((income) => {
      this.monthlyIncome = income;
      console.log('ngOnInit - Monthly Income:', income);
      this.updateBarChartData();
      console.log('ngOnInit - barChartData after income update:', this.barChartData);
    });

    this.ExpenseService.getMonthlyExpense().subscribe((expense) => {
      this.monthlyExpense = expense;
      console.log('ngOnInit - Monthly Expense:', expense);
      this.updateBarChartData();
      console.log('ngOnInit - barChartData after expense update:', this.barChartData);
    });

    this.loadRecentData();
    this.calculateFinalFunds();
  }

  updateBarChartLabels(): void {
    console.log('updateBarChartLabels - currentMonthName:', this.currentMonthName);
    console.log('updateBarChartLabels - initial barChartData:', this.barChartData);
    if (this.barChartData && this.barChartData.labels && this.barChartData.datasets && this.barChartData.datasets.length >= 2) {
      const currentMonthIndex = this.barChartData.labels.indexOf(this.currentMonthName);
      console.log('updateBarChartLabels - currentMonthIndex:', currentMonthIndex);
      if (currentMonthIndex === -1) {
        this.barChartData.labels.push(this.currentMonthName);
        console.log('updateBarChartLabels - labels after push:', this.barChartData.labels);
        if (this.barChartData.labels.length > 3) {
          this.barChartData.labels.shift();
          if (this.barChartData.datasets[0] && this.barChartData.datasets[0].data) {
            this.barChartData.datasets[0].data.shift();
            console.log('updateBarChartLabels - income data after shift:', this.barChartData.datasets[0].data);
          }
          if (this.barChartData.datasets[1] && this.barChartData.datasets[1].data) {
            this.barChartData.datasets[1].data.shift();
            console.log('updateBarChartLabels - expense data after shift:', this.barChartData.datasets[1].data);
          }
        } else {
          if (this.barChartData.datasets[0] && this.barChartData.datasets[0].data) {
            this.barChartData.datasets[0].data.push(0);
            console.log('updateBarChartLabels - income data after push 0:', this.barChartData.datasets[0].data);
          }
          if (this.barChartData.datasets[1] && this.barChartData.datasets[1].data) {
            this.barChartData.datasets[1].data.push(0);
            console.log('updateBarChartLabels - expense data after push 0:', this.barChartData.datasets[1].data);
          }
        }
      }
    }
    console.log('updateBarChartLabels - final barChartData:', this.barChartData);
  }

  updateBarChartData(): void {
    console.log('updateBarChartData - currentMonthName:', this.currentMonthName);
    console.log('updateBarChartData - initial barChartData:', this.barChartData);
    if (this.barChartData && this.barChartData.labels && this.barChartData.datasets && this.barChartData.datasets.length >= 2) {
      const currentMonthIndex = this.barChartData.labels.indexOf(this.currentMonthName);
      console.log('updateBarChartData - currentMonthIndex:', currentMonthIndex);
      if (currentMonthIndex !== -1) {
        if (this.barChartData.datasets[0] && this.barChartData.datasets[0].data) {
          this.barChartData.datasets[0].data[currentMonthIndex] = this.monthlyIncome;
          console.log('updateBarChartData - income data updated:', this.barChartData.datasets[0].data);
        }
        if (this.barChartData.datasets[1] && this.barChartData.datasets[1].data) {
          this.barChartData.datasets[1].data[currentMonthIndex] = this.monthlyExpense;
          console.log('updateBarChartData - expense data updated:', this.barChartData.datasets[1].data);
        }

        if (this.barChartRef?.chart) {
      this.barChartRef.chart.update();
      console.log('updateBarChartData - chart updated');
      } else {
      console.log('updateBarChartData - chart reference not yet available');
      }
        // Optionally trigger chart update here if needed
      }
    }
    console.log('updateBarChartData - final barChartData:', this.barChartData);
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

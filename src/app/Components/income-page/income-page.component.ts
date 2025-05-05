import { Component, inject } from '@angular/core';
import { AddIncomeComponent } from '../add-income/add-income.component';
import { IncomeListComponent } from '../income-list/income-list.component';

@Component({
  selector: 'app-income-page',
  imports: [AddIncomeComponent, IncomeListComponent],
  templateUrl: './income-page.component.html',
  styleUrl: './income-page.component.css',
})
export class IncomePageComponent {}

import { Component, inject } from '@angular/core';
import { IncomeService } from '../../Services/Income Service/income.service';
import { Income } from '../../income';
import { FormsModule } from '@angular/forms';
import { AddIncomeComponent } from '../add-income/add-income.component';
import { IncomeListComponent } from '../income-list/income-list.component';

@Component({
  selector: 'app-income-page',
  imports: [FormsModule, AddIncomeComponent, IncomeListComponent],
  templateUrl: './income-page.component.html',
  styleUrl: './income-page.component.css',
})
export class IncomePageComponent {}

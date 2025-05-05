import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensePageComponent } from './expense-page.component';

describe('ExpensePageComponent', () => {
  let component: ExpensePageComponent;
  let fixture: ComponentFixture<ExpensePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

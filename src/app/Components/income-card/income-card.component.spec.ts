import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeCardComponent } from './income-card.component';

describe('IncomeCardComponent', () => {
  let component: IncomeCardComponent;
  let fixture: ComponentFixture<IncomeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

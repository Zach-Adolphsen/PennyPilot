import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomePageComponent } from './income-page.component';

describe('IncomePageComponent', () => {
  let component: IncomePageComponent;
  let fixture: ComponentFixture<IncomePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

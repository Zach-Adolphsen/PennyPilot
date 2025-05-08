import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoneySavedComponent } from './money-saved.component';

describe('MoneySavedComponent', () => {
  let component: MoneySavedComponent;
  let fixture: ComponentFixture<MoneySavedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoneySavedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoneySavedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

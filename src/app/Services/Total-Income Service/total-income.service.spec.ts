import { TestBed } from '@angular/core/testing';

import { TotalIncomeService } from './total-income.service';

describe('TotalIncomeService', () => {
  let service: TotalIncomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TotalIncomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

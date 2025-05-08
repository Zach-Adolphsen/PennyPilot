import { TestBed } from '@angular/core/testing';

import { TotalExpenseService } from './total-expense.service';

describe('TotalExpenseService', () => {
  let service: TotalExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TotalExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { AutomotoresStateService } from './automotores.state.service';

describe('AutomotoresStateService', () => {
  let service: AutomotoresStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutomotoresStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

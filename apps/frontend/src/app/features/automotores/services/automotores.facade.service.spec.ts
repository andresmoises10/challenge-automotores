import { TestBed } from '@angular/core/testing';

import { AutomotoresFacadeService } from './automotores.facade.service';

describe('AutomotoresFacadeService', () => {
  let service: AutomotoresFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutomotoresFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { AutomotoresApiService } from './automotores.api.service';

describe('AutomotoresApiService', () => {
  let service: AutomotoresApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutomotoresApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

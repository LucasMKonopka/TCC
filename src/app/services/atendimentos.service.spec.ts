import { TestBed } from '@angular/core/testing';

import { AtendimentosService } from './atendimentos.service';

describe('AtendimentosService', () => {
  let service: AtendimentosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AtendimentosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

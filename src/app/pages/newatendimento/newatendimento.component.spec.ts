import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewatendimentoComponent } from './newatendimento.component';

describe('NewatendimentoComponent', () => {
  let component: NewatendimentoComponent;
  let fixture: ComponentFixture<NewatendimentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewatendimentoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewatendimentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

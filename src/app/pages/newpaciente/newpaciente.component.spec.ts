import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewpacienteComponent } from './newpaciente.component';

describe('NewpacienteComponent', () => {
  let component: NewpacienteComponent;
  let fixture: ComponentFixture<NewpacienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewpacienteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewpacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

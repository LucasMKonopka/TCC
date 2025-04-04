import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListpacientesComponent } from './listpacientes.component';

describe('ListpacientesComponent', () => {
  let component: ListpacientesComponent;
  let fixture: ComponentFixture<ListpacientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListpacientesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListpacientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

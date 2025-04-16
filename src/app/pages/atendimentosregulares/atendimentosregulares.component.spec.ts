import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtendimentosregularesComponent } from './atendimentosregulares.component';

describe('AtendimentosregularesComponent', () => {
  let component: AtendimentosregularesComponent;
  let fixture: ComponentFixture<AtendimentosregularesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AtendimentosregularesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AtendimentosregularesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

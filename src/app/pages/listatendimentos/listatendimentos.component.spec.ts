import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListatendimentosComponent } from './listatendimentos.component';

describe('ListatendimentosComponent', () => {
  let component: ListatendimentosComponent;
  let fixture: ComponentFixture<ListatendimentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListatendimentosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListatendimentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

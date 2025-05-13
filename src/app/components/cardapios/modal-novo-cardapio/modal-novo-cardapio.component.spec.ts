import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNovoCardapioComponent } from './modal-novo-cardapio.component';

describe('ModalNovoCardapioComponent', () => {
  let component: ModalNovoCardapioComponent;
  let fixture: ComponentFixture<ModalNovoCardapioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalNovoCardapioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalNovoCardapioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

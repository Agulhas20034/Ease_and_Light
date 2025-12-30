import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriaEntregaClientePage } from './cria-entrega-cliente.page';

describe('CriaEntregaClientePage', () => {
  let component: CriaEntregaClientePage;
  let fixture: ComponentFixture<CriaEntregaClientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CriaEntregaClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

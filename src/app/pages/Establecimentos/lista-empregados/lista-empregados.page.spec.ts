import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaEmpregadosPage } from './lista-empregados.page';

describe('ListaEmpregadosPage', () => {
  let component: ListaEmpregadosPage;
  let fixture: ComponentFixture<ListaEmpregadosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaEmpregadosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

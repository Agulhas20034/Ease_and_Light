import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaFuncionariosPage } from './lista-funcionarios.page';

describe('ListaFuncionariosPage', () => {
  let component: ListaFuncionariosPage;
  let fixture: ComponentFixture<ListaFuncionariosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaFuncionariosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

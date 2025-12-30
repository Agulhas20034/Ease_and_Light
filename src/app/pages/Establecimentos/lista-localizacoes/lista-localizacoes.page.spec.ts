import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaLocalizacoesPage } from './lista-localizacoes.page';

describe('ListaLocalizacoesPage', () => {
  let component: ListaLocalizacoesPage;
  let fixture: ComponentFixture<ListaLocalizacoesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaLocalizacoesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

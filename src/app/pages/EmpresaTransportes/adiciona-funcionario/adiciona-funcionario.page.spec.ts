import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdicionaFuncionarioPage } from './adiciona-funcionario.page';

describe('AdicionaFuncionarioPage', () => {
  let component: AdicionaFuncionarioPage;
  let fixture: ComponentFixture<AdicionaFuncionarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdicionaFuncionarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

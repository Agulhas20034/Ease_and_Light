import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditaFuncionarioPage } from './edita-funcionario.page';

describe('EditaFuncionarioPage', () => {
  let component: EditaFuncionarioPage;
  let fixture: ComponentFixture<EditaFuncionarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditaFuncionarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

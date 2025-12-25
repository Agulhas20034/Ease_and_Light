import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditaEmpregadoPage } from './edita-empregado.page';

describe('EditaEmpregadoPage', () => {
  let component: EditaEmpregadoPage;
  let fixture: ComponentFixture<EditaEmpregadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditaEmpregadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

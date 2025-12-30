import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriaEmpregadoPage } from './cria-empregado.page';

describe('CriaEmpregadoPage', () => {
  let component: CriaEmpregadoPage;
  let fixture: ComponentFixture<CriaEmpregadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CriaEmpregadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

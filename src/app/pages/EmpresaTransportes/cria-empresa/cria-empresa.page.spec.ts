import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriaEmpresaPage } from './cria-empresa.page';

describe('CriaEmpresaPage', () => {
  let component: CriaEmpresaPage;
  let fixture: ComponentFixture<CriaEmpresaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CriaEmpresaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

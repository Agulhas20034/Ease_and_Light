import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GereEmpresasPage } from './gere-empresas.page';

describe('GereEmpresasPage', () => {
  let component: GereEmpresasPage;
  let fixture: ComponentFixture<GereEmpresasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GereEmpresasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

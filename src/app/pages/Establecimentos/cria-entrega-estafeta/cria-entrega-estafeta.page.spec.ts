import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriaEntregaEstafetaPage } from './cria-entrega-estafeta.page';

describe('CriaEntregaEstafetaPage', () => {
  let component: CriaEntregaEstafetaPage;
  let fixture: ComponentFixture<CriaEntregaEstafetaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CriaEntregaEstafetaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

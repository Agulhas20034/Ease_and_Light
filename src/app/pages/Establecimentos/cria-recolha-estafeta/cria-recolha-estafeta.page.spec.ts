import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriaRecolhaEstafetaPage } from './cria-recolha-estafeta.page';

describe('CriaRecolhaEstafetaPage', () => {
  let component: CriaRecolhaEstafetaPage;
  let fixture: ComponentFixture<CriaRecolhaEstafetaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CriaRecolhaEstafetaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

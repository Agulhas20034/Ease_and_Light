import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditaEmpresaPage } from './edita-empresa.page';

describe('EditaEmpresaPage', () => {
  let component: EditaEmpresaPage;
  let fixture: ComponentFixture<EditaEmpresaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditaEmpresaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

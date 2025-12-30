import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriaPercursoPage } from './cria-percurso.page';

describe('CriaPercursoPage', () => {
  let component: CriaPercursoPage;
  let fixture: ComponentFixture<CriaPercursoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CriaPercursoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GerePercursoPage } from './gere-percurso.page';

describe('GerePercursoPage', () => {
  let component: GerePercursoPage;
  let fixture: ComponentFixture<GerePercursoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GerePercursoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriaRecolhaClientePage } from './cria-recolha-cliente.page';

describe('CriaRecolhaClientePage', () => {
  let component: CriaRecolhaClientePage;
  let fixture: ComponentFixture<CriaRecolhaClientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CriaRecolhaClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

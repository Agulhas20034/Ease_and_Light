import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriaContasPage } from './cria-contas.page';

describe('CriaContasPage', () => {
  let component: CriaContasPage;
  let fixture: ComponentFixture<CriaContasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CriaContasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

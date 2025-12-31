import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GereVeiculosPage } from './gere-veiculos.page';

describe('GereVeiculosPage', () => {
  let component: GereVeiculosPage;
  let fixture: ComponentFixture<GereVeiculosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GereVeiculosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

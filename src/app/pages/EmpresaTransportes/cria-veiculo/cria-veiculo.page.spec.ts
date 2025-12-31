import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriaVeiculoPage } from './cria-veiculo.page';

describe('CriaVeiculoPage', () => {
  let component: CriaVeiculoPage;
  let fixture: ComponentFixture<CriaVeiculoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CriaVeiculoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

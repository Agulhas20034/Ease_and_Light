import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditaVeiculoPage } from './edita-veiculo.page';

describe('EditaVeiculoPage', () => {
  let component: EditaVeiculoPage;
  let fixture: ComponentFixture<EditaVeiculoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditaVeiculoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AtribuiPedidoPage } from './atribui-pedido.page';

describe('AtribuiPedidoPage', () => {
  let component: AtribuiPedidoPage;
  let fixture: ComponentFixture<AtribuiPedidoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AtribuiPedidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

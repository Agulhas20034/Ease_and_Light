import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VePedidosPage } from './ve-pedidos.page';

describe('VePedidosPage', () => {
  let component: VePedidosPage;
  let fixture: ComponentFixture<VePedidosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VePedidosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

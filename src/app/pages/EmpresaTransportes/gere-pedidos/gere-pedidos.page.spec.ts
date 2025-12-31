import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GerePedidosPage } from './gere-pedidos.page';

describe('GerePedidosPage', () => {
  let component: GerePedidosPage;
  let fixture: ComponentFixture<GerePedidosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GerePedidosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaMochilasPage } from './lista-mochilas.page';

describe('ListaMochilasPage', () => {
  let component: ListaMochilasPage;
  let fixture: ComponentFixture<ListaMochilasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaMochilasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

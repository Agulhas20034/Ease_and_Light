import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistaMochilaPage } from './regista-mochila.page';

describe('RegistaMochilaPage', () => {
  let component: RegistaMochilaPage;
  let fixture: ComponentFixture<RegistaMochilaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistaMochilaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

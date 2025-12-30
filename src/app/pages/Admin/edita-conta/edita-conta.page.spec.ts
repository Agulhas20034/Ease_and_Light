import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditaContaPage } from './edita-conta.page';

describe('EditaContaPage', () => {
  let component: EditaContaPage;
  let fixture: ComponentFixture<EditaContaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditaContaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

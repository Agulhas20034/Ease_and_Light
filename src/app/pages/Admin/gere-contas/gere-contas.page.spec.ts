import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GereContasPage } from './gere-contas.page';

describe('GereContasPage', () => {
  let component: GereContasPage;
  let fixture: ComponentFixture<GereContasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GereContasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

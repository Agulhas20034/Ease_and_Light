import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditaInfoPage } from './edita-info.page';

describe('EditaInfoPage', () => {
  let component: EditaInfoPage;
  let fixture: ComponentFixture<EditaInfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditaInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

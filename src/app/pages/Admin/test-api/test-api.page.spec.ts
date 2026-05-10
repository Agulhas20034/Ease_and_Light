import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestApiPage } from './test-api.page';

describe('TestApiPage', () => {
  let component: TestApiPage;
  let fixture: ComponentFixture<TestApiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestApiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

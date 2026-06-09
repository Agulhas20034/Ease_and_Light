import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewsPercursoPage } from './reviews-percurso.page';

describe('ReviewsPercursoPage', () => {
  let component: ReviewsPercursoPage;
  let fixture: ComponentFixture<ReviewsPercursoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewsPercursoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

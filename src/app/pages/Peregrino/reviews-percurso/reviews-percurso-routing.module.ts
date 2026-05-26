import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReviewsPercursoPage } from './reviews-percurso.page';

const routes: Routes = [
  {
    path: '',
    component: ReviewsPercursoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReviewsPercursoPageRoutingModule {}

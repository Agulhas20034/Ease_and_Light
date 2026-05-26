import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReviewsPercursoPageRoutingModule } from './reviews-percurso-routing.module';

import { ReviewsPercursoPage } from './reviews-percurso.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReviewsPercursoPageRoutingModule
  ],
  declarations: [ReviewsPercursoPage],
  exports: [ReviewsPercursoPage]
})
export class ReviewsPercursoPageModule {}

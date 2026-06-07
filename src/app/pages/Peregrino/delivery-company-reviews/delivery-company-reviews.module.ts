import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DeliveryCompanyReviewsPageRoutingModule } from './delivery-company-reviews-routing.module';

import { DeliveryCompanyReviewsPage } from './delivery-company-reviews.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveryCompanyReviewsPageRoutingModule
  ],
  declarations: [DeliveryCompanyReviewsPage]
})
export class DeliveryCompanyReviewsPageModule {}

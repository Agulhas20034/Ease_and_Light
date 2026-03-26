import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TestApiPageRoutingModule } from './test-api-routing.module';

import { TestApiPage } from './test-api.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TestApiPageRoutingModule
  ],
  declarations: [TestApiPage]
})
export class TestApiPageModule {}

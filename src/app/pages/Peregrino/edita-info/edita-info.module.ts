import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditaInfoPageRoutingModule } from './edita-info-routing.module';

import { EditaInfoPage } from './edita-info.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditaInfoPageRoutingModule
  ],
  declarations: [EditaInfoPage]
})
export class EditaInfoPageModule {}

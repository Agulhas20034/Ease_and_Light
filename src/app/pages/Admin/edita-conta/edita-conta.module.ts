import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditaContaPageRoutingModule } from './edita-conta-routing.module';

import { EditaContaPage } from './edita-conta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditaContaPageRoutingModule
  ],
  declarations: [EditaContaPage]
})
export class EditaContaPageModule {}

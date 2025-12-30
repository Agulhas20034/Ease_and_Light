import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditaLocalizacaoPageRoutingModule } from './edita-localizacao-routing.module';

import { EditaLocalizacaoPage } from './edita-localizacao.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditaLocalizacaoPageRoutingModule
  ],
  declarations: [EditaLocalizacaoPage]
})
export class EditaLocalizacaoPageModule {}

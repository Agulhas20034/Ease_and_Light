import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CriaLocalizacaoPageRoutingModule } from './cria-localizacao-routing.module';

import { CriaLocalizacaoPage } from './cria-localizacao.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CriaLocalizacaoPageRoutingModule
  ],
  declarations: [CriaLocalizacaoPage]
})
export class CriaLocalizacaoPageModule {}

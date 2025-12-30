import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaLocalizacoesPageRoutingModule } from './lista-localizacoes-routing.module';

import { ListaLocalizacoesPage } from './lista-localizacoes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaLocalizacoesPageRoutingModule
  ],
  declarations: [ListaLocalizacoesPage]
})
export class ListaLocalizacoesPageModule {}

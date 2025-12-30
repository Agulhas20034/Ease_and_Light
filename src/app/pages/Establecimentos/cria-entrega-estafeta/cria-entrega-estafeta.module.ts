import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CriaEntregaEstafetaPageRoutingModule } from './cria-entrega-estafeta-routing.module';

import { CriaEntregaEstafetaPage } from './cria-entrega-estafeta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CriaEntregaEstafetaPageRoutingModule
  ],
  declarations: [CriaEntregaEstafetaPage]
})
export class CriaEntregaEstafetaPageModule {}

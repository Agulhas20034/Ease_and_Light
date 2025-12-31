import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GerePedidosPageRoutingModule } from './gere-pedidos-routing.module';

import { GerePedidosPage } from './gere-pedidos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GerePedidosPageRoutingModule
  ],
  declarations: [GerePedidosPage]
})
export class GerePedidosPageModule {}

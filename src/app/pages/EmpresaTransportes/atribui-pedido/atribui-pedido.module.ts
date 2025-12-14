import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AtribuiPedidoPageRoutingModule } from './atribui-pedido-routing.module';

import { AtribuiPedidoPage } from './atribui-pedido.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AtribuiPedidoPageRoutingModule
  ],
  declarations: [AtribuiPedidoPage]
})
export class AtribuiPedidoPageModule {}

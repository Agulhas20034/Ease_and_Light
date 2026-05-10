import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VePedidosPageRoutingModule } from './ve-pedidos-routing.module';

import { VePedidosPage } from './ve-pedidos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VePedidosPageRoutingModule
  ],
  declarations: [VePedidosPage]
})
export class VePedidosPageModule {}

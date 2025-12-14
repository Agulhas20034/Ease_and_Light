import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CriaEntregaClientePageRoutingModule } from './cria-entrega-cliente-routing.module';

import { CriaEntregaClientePage } from './cria-entrega-cliente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CriaEntregaClientePageRoutingModule
  ],
  declarations: [CriaEntregaClientePage]
})
export class CriaEntregaClientePageModule {}

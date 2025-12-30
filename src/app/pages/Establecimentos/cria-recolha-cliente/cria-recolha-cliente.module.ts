import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CriaRecolhaClientePageRoutingModule } from './cria-recolha-cliente-routing.module';

import { CriaRecolhaClientePage } from './cria-recolha-cliente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CriaRecolhaClientePageRoutingModule
  ],
  declarations: [CriaRecolhaClientePage]
})
export class CriaRecolhaClientePageModule {}

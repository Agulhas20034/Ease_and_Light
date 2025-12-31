import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GereVeiculosPageRoutingModule } from './gere-veiculos-routing.module';

import { GereVeiculosPage } from './gere-veiculos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GereVeiculosPageRoutingModule
  ],
  declarations: [GereVeiculosPage]
})
export class GereVeiculosPageModule {}

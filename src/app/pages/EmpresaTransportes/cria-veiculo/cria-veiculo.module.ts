import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CriaVeiculoPageRoutingModule } from './cria-veiculo-routing.module';

import { CriaVeiculoPage } from './cria-veiculo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CriaVeiculoPageRoutingModule
  ],
  declarations: [CriaVeiculoPage]
})
export class CriaVeiculoPageModule {}

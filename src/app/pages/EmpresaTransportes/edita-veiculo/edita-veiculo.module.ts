import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditaVeiculoPageRoutingModule } from './edita-veiculo-routing.module';

import { EditaVeiculoPage } from './edita-veiculo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditaVeiculoPageRoutingModule
  ],
  declarations: [EditaVeiculoPage]
})
export class EditaVeiculoPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CriaEmpregadoPageRoutingModule } from './cria-empregado-routing.module';

import { CriaEmpregadoPage } from './cria-empregado.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CriaEmpregadoPageRoutingModule
  ],
  declarations: [CriaEmpregadoPage]
})
export class CriaEmpregadoPageModule {}

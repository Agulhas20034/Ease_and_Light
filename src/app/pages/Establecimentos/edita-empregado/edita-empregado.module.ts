import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditaEmpregadoPageRoutingModule } from './edita-empregado-routing.module';

import { EditaEmpregadoPage } from './edita-empregado.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditaEmpregadoPageRoutingModule
  ],
  declarations: [EditaEmpregadoPage]
})
export class EditaEmpregadoPageModule {}

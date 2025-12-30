import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditaFuncionarioPageRoutingModule } from './edita-funcionario-routing.module';

import { EditaFuncionarioPage } from './edita-funcionario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditaFuncionarioPageRoutingModule
  ],
  declarations: [EditaFuncionarioPage]
})
export class EditaFuncionarioPageModule {}

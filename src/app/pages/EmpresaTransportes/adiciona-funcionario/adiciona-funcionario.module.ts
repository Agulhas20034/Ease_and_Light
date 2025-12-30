import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdicionaFuncionarioPageRoutingModule } from './adiciona-funcionario-routing.module';

import { AdicionaFuncionarioPage } from './adiciona-funcionario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdicionaFuncionarioPageRoutingModule
  ],
  declarations: [AdicionaFuncionarioPage]
})
export class AdicionaFuncionarioPageModule {}

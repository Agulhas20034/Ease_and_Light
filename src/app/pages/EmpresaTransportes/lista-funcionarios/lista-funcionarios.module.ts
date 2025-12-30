import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaFuncionariosPageRoutingModule } from './lista-funcionarios-routing.module';

import { ListaFuncionariosPage } from './lista-funcionarios.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaFuncionariosPageRoutingModule
  ],
  declarations: [ListaFuncionariosPage]
})
export class ListaFuncionariosPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaEmpregadosPageRoutingModule } from './lista-empregados-routing.module';

import { ListaEmpregadosPage } from './lista-empregados.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaEmpregadosPageRoutingModule
  ],
  declarations: [ListaEmpregadosPage]
})
export class ListaEmpregadosPageModule {}

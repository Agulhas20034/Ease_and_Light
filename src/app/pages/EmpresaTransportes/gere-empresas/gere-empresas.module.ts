import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GereEmpresasPageRoutingModule } from './gere-empresas-routing.module';

import { GereEmpresasPage } from './gere-empresas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GereEmpresasPageRoutingModule
  ],
  declarations: [GereEmpresasPage]
})
export class GereEmpresasPageModule {}

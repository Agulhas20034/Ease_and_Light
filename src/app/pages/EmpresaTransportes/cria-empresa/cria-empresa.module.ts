import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CriaEmpresaPageRoutingModule } from './cria-empresa-routing.module';

import { CriaEmpresaPage } from './cria-empresa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CriaEmpresaPageRoutingModule
  ],
  declarations: [CriaEmpresaPage]
})
export class CriaEmpresaPageModule {}

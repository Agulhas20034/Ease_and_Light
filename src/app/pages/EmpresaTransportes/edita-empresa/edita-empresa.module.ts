import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditaEmpresaPageRoutingModule } from './edita-empresa-routing.module';

import { EditaEmpresaPage } from './edita-empresa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditaEmpresaPageRoutingModule
  ],
  declarations: [EditaEmpresaPage]
})
export class EditaEmpresaPageModule {}

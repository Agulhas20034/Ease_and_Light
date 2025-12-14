import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CriaContasPageRoutingModule } from './cria-contas-routing.module';

import { CriaContasPage } from './cria-contas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CriaContasPageRoutingModule
  ],
  declarations: [CriaContasPage]
})
export class CriaContasPageModule {}

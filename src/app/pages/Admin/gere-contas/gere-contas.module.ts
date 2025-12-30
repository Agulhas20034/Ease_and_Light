import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GereContasPageRoutingModule } from './gere-contas-routing.module';

import { GereContasPage } from './gere-contas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GereContasPageRoutingModule
  ],
  declarations: [GereContasPage]
})
export class GereContasPageModule {}

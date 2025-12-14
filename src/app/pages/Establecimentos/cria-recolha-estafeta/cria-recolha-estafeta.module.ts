import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CriaRecolhaEstafetaPageRoutingModule } from './cria-recolha-estafeta-routing.module';

import { CriaRecolhaEstafetaPage } from './cria-recolha-estafeta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CriaRecolhaEstafetaPageRoutingModule
  ],
  declarations: [CriaRecolhaEstafetaPage]
})
export class CriaRecolhaEstafetaPageModule {}

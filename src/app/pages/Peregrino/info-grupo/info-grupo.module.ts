import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InfoGrupoPageRoutingModule } from './info-grupo-routing.module';

import { InfoGrupoPage } from './info-grupo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfoGrupoPageRoutingModule
  ],
  declarations: [InfoGrupoPage]
})
export class InfoGrupoPageModule {}

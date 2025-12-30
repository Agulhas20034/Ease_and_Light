import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GereGrupoPageRoutingModule } from './gere-grupo-routing.module';

import { GereGrupoPage } from './gere-grupo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GereGrupoPageRoutingModule
  ],
  declarations: [GereGrupoPage]
})
export class GereGrupoPageModule {}

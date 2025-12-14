import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CriaGrupoPageRoutingModule } from './cria-grupo-routing.module';

import { CriaGrupoPage } from './cria-grupo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CriaGrupoPageRoutingModule
  ],
  declarations: [CriaGrupoPage]
})
export class CriaGrupoPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditaGrupoPageRoutingModule } from './edita-grupo-routing.module';

import { EditaGrupoPage } from './edita-grupo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditaGrupoPageRoutingModule
  ],
  declarations: [EditaGrupoPage]
})
export class EditaGrupoPageModule {}

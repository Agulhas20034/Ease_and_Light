import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CriaPercursoPageRoutingModule } from './cria-percurso-routing.module';

import { CriaPercursoPage } from './cria-percurso.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CriaPercursoPageRoutingModule
  ],
  declarations: [CriaPercursoPage]
})
export class CriaPercursoPageModule {}

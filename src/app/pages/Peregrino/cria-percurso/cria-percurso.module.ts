import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CriaPercursoPageRoutingModule } from './cria-percurso-routing.module';

import { CriaPercursoPage } from './cria-percurso.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CriaPercursoPageRoutingModule
  ],
  declarations: [CriaPercursoPage]
})
export class CriaPercursoPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GerePercursoPageRoutingModule } from './gere-percurso-routing.module';

import { GerePercursoPage } from './gere-percurso.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GerePercursoPageRoutingModule
  ],
  declarations: [GerePercursoPage]
})
export class GerePercursoPageModule {}

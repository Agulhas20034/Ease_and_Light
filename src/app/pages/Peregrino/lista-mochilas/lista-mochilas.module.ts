import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaMochilasPageRoutingModule } from './lista-mochilas-routing.module';

import { ListaMochilasPage } from './lista-mochilas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaMochilasPageRoutingModule
  ],
  declarations: [ListaMochilasPage]
})
export class ListaMochilasPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistaMochilaPageRoutingModule } from './regista-mochila-routing.module';

import { RegistaMochilaPage } from './regista-mochila.page';
import { OwnerPopoverComponent } from '../owner-popover.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistaMochilaPageRoutingModule
  ],
  declarations: [RegistaMochilaPage, OwnerPopoverComponent]
})
export class RegistaMochilaPageModule {}

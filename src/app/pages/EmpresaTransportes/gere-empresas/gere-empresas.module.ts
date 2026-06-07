import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GereEmpresasPageRoutingModule } from './gere-empresas-routing.module';

import { GereEmpresasPage } from './gere-empresas.page';
import { DeliveryHistoryModalComponent } from '../../../components/delivery-history-modal/delivery-history-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GereEmpresasPageRoutingModule,
    DeliveryHistoryModalComponent
  ],
  declarations: [GereEmpresasPage]
})
export class GereEmpresasPageModule {}

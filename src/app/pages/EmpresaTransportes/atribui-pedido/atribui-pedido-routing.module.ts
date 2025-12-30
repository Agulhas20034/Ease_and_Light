import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AtribuiPedidoPage } from './atribui-pedido.page';

const routes: Routes = [
  {
    path: '',
    component: AtribuiPedidoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AtribuiPedidoPageRoutingModule {}

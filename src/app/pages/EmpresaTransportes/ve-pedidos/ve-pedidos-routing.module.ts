import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VePedidosPage } from './ve-pedidos.page';

const routes: Routes = [
  {
    path: '',
    component: VePedidosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VePedidosPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GerePedidosPage } from './gere-pedidos.page';

const routes: Routes = [
  {
    path: '',
    component: GerePedidosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GerePedidosPageRoutingModule {}

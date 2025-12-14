import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CriaEntregaClientePage } from './cria-entrega-cliente.page';

const routes: Routes = [
  {
    path: '',
    component: CriaEntregaClientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CriaEntregaClientePageRoutingModule {}

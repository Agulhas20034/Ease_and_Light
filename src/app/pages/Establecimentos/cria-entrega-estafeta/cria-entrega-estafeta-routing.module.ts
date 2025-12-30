import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CriaEntregaEstafetaPage } from './cria-entrega-estafeta.page';

const routes: Routes = [
  {
    path: '',
    component: CriaEntregaEstafetaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CriaEntregaEstafetaPageRoutingModule {}

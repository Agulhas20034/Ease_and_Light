import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaEmpregadosPage } from './lista-empregados.page';

const routes: Routes = [
  {
    path: '',
    component: ListaEmpregadosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaEmpregadosPageRoutingModule {}

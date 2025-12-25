import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaLocalizacoesPage } from './lista-localizacoes.page';

const routes: Routes = [
  {
    path: '',
    component: ListaLocalizacoesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaLocalizacoesPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaMochilasPage } from './lista-mochilas.page';

const routes: Routes = [
  {
    path: '',
    component: ListaMochilasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaMochilasPageRoutingModule {}

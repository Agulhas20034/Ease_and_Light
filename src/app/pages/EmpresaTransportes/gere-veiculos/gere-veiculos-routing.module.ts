import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GereVeiculosPage } from './gere-veiculos.page';

const routes: Routes = [
  {
    path: '',
    component: GereVeiculosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GereVeiculosPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GereContasPage } from './gere-contas.page';

const routes: Routes = [
  {
    path: '',
    component: GereContasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GereContasPageRoutingModule {}

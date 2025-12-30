import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GereEmpresasPage } from './gere-empresas.page';

const routes: Routes = [
  {
    path: '',
    component: GereEmpresasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GereEmpresasPageRoutingModule {}

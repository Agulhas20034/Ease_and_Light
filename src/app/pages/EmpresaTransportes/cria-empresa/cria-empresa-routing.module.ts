import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CriaEmpresaPage } from './cria-empresa.page';

const routes: Routes = [
  {
    path: '',
    component: CriaEmpresaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CriaEmpresaPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CriaEmpregadoPage } from './cria-empregado.page';

const routes: Routes = [
  {
    path: '',
    component: CriaEmpregadoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CriaEmpregadoPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditaEmpregadoPage } from './edita-empregado.page';

const routes: Routes = [
  {
    path: '',
    component: EditaEmpregadoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditaEmpregadoPageRoutingModule {}

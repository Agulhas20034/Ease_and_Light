import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditaFuncionarioPage } from './edita-funcionario.page';

const routes: Routes = [
  {
    path: '',
    component: EditaFuncionarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditaFuncionarioPageRoutingModule {}

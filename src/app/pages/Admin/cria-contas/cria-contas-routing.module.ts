import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CriaContasPage } from './cria-contas.page';

const routes: Routes = [
  {
    path: '',
    component: CriaContasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CriaContasPageRoutingModule {}

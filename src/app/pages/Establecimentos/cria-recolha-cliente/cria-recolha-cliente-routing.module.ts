import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CriaRecolhaClientePage } from './cria-recolha-cliente.page';

const routes: Routes = [
  {
    path: '',
    component: CriaRecolhaClientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CriaRecolhaClientePageRoutingModule {}

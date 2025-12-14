import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CriaRecolhaEstafetaPage } from './cria-recolha-estafeta.page';

const routes: Routes = [
  {
    path: '',
    component: CriaRecolhaEstafetaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CriaRecolhaEstafetaPageRoutingModule {}

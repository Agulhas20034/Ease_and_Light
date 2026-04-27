import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfoGrupoPage } from './info-grupo.page';

const routes: Routes = [
  {
    path: ':id',
    component: InfoGrupoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfoGrupoPageRoutingModule {}

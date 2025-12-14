import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditaGrupoPage } from './edita-grupo.page';

const routes: Routes = [
  {
    path: '',
    component: EditaGrupoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditaGrupoPageRoutingModule {}

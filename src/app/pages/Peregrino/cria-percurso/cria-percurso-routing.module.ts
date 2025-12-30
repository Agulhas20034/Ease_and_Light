import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CriaPercursoPage } from './cria-percurso.page';

const routes: Routes = [
  {
    path: '',
    component: CriaPercursoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CriaPercursoPageRoutingModule {}

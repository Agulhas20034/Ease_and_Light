import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GerePercursoPage } from './gere-percurso.page';

const routes: Routes = [
  {
    path: '',
    component: GerePercursoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GerePercursoPageRoutingModule {}

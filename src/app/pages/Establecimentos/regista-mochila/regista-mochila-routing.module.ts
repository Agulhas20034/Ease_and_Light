import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistaMochilaPage } from './regista-mochila.page';

const routes: Routes = [
  {
    path: '',
    component: RegistaMochilaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistaMochilaPageRoutingModule {}

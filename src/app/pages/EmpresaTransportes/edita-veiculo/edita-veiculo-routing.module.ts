import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditaVeiculoPage } from './edita-veiculo.page';

const routes: Routes = [
  {
    path: '',
    component: EditaVeiculoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditaVeiculoPageRoutingModule {}

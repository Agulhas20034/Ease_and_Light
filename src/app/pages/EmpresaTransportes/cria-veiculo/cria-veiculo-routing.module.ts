import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CriaVeiculoPage } from './cria-veiculo.page';

const routes: Routes = [
  {
    path: '',
    component: CriaVeiculoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CriaVeiculoPageRoutingModule {}

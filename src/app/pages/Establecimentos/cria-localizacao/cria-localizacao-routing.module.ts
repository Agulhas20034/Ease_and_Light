import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CriaLocalizacaoPage } from './cria-localizacao.page';

const routes: Routes = [
  {
    path: '',
    component: CriaLocalizacaoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CriaLocalizacaoPageRoutingModule {}

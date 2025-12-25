import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditaLocalizacaoPage } from './edita-localizacao.page';

const routes: Routes = [
  {
    path: '',
    component: EditaLocalizacaoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditaLocalizacaoPageRoutingModule {}

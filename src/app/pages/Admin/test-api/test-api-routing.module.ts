import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TestApiPage } from './test-api.page';

const routes: Routes = [
  {
    path: '',
    component: TestApiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TestApiPageRoutingModule {}

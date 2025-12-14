import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./pages/folder/folder.module').then( m => m.FolderPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  }
  ,
  {
    path: 'splash',
    loadChildren: () => import('./pages/splash/splash.module').then(m => m.SplashPageModule)
  },
  {
    path: 'adiciona-funcionario',
    loadChildren: () => import('./pages/EmpresaTransportes/adiciona-funcionario/adiciona-funcionario.module').then( m => m.AdicionaFuncionarioPageModule)
  },
  {
    path: 'lista-funcionarios',
    loadChildren: () => import('./pages/EmpresaTransportes/lista-funcionarios/lista-funcionarios.module').then( m => m.ListaFuncionariosPageModule)
  },
  {
    path: 'edita-funcionario',
    loadChildren: () => import('./pages/EmpresaTransportes/edita-funcionario/edita-funcionario.module').then( m => m.EditaFuncionarioPageModule)
  },
  {
    path: 'atribui-rota',
    loadChildren: () => import('./pages/EmpresaTransportes/atribui-rota/atribui-rota.module').then( m => m.AtribuiRotaPageModule)
  },
  {
    path: 'lista-pedidos',
    loadChildren: () => import('./pages/EmpresaTransportes/lista-pedidos/lista-pedidos.module').then( m => m.ListaPedidosPageModule)
  },
  {
    path: 'gere-rotas',
    loadChildren: () => import('./pages/EmpresaTransportes/gere-rotas/gere-rotas.module').then( m => m.GereRotasPageModule)
  },
  {
    path: 'atribui-pedido',
    loadChildren: () => import('./pages/EmpresaTransportes/atribui-pedido/atribui-pedido.module').then( m => m.AtribuiPedidoPageModule)
  },
  {
    path: 'cria-percurso',
    loadChildren: () => import('./pages/Peregrino/cria-percurso/cria-percurso.module').then( m => m.CriaPercursoPageModule)
  },
  {
    path: 'gere-percurso',
    loadChildren: () => import('./pages/Peregrino/gere-percurso/gere-percurso.module').then( m => m.GerePercursoPageModule)
  },
  {
    path: 'gere-grupo',
    loadChildren: () => import('./pages/Peregrino/gere-grupo/gere-grupo.module').then( m => m.GereGrupoPageModule)
  },
  {
    path: 'cria-grupo',
    loadChildren: () => import('./pages/Peregrino/cria-grupo/cria-grupo.module').then( m => m.CriaGrupoPageModule)
  },
  {
    path: 'edita-grupo',
    loadChildren: () => import('./pages/Peregrino/edita-grupo/edita-grupo.module').then( m => m.EditaGrupoPageModule)
  },
  {
    path: 'lista-mochilas',
    loadChildren: () => import('./pages/Peregrino/lista-mochilas/lista-mochilas.module').then( m => m.ListaMochilasPageModule)
  },
  {
    path: 'establecimentos',
    loadChildren: () => import('./pages/establecimentos/establecimentos.module').then( m => m.EstablecimentosPageModule)
  },
  {
    path: 'cria-recolha-cliente',
    loadChildren: () => import('./pages/Establecimentos/cria-recolha-cliente/cria-recolha-cliente.module').then( m => m.CriaRecolhaClientePageModule)
  },
  {
    path: 'cria-recolha-estafeta',
    loadChildren: () => import('./pages/Establecimentos/cria-recolha-estafeta/cria-recolha-estafeta.module').then( m => m.CriaRecolhaEstafetaPageModule)
  },
  {
    path: 'cria-entrega-estafeta',
    loadChildren: () => import('./pages/Establecimentos/cria-entrega-estafeta/cria-entrega-estafeta.module').then( m => m.CriaEntregaEstafetaPageModule)
  },
  {
    path: 'cria-entrega-cliente',
    loadChildren: () => import('./pages/Establecimentos/cria-entrega-cliente/cria-entrega-cliente.module').then( m => m.CriaEntregaClientePageModule)
  },
  {
    path: 'regista-mochila',
    loadChildren: () => import('./pages/Establecimentos/regista-mochila/regista-mochila.module').then( m => m.RegistaMochilaPageModule)
  },
  {
    path: 'cria-contas',
    loadChildren: () => import('./pages/Admin/cria-contas/cria-contas.module').then( m => m.CriaContasPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

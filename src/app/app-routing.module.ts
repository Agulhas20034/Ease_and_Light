import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { RoleGuard } from './guards/role.guard';

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
    loadChildren: () => import('./pages/EmpresaTransportes/adiciona-funcionario/adiciona-funcionario.module').then( m => m.AdicionaFuncionarioPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Empresa Transportes' }
  },
  {
    path: 'lista-funcionarios',
    loadChildren: () => import('./pages/EmpresaTransportes/lista-funcionarios/lista-funcionarios.module').then( m => m.ListaFuncionariosPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Empresa Transportes' }
  },
  {
    path: 'edita-funcionario',
    loadChildren: () => import('./pages/EmpresaTransportes/edita-funcionario/edita-funcionario.module').then( m => m.EditaFuncionarioPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Empresa Transportes' }
  },
  
  {
    path: 'lista-pedidos',
    loadChildren: () => import('./pages/EmpresaTransportes/lista-pedidos/lista-pedidos.module').then( m => m.ListaPedidosPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Empresa Transportes' }
  },
  {
    path: 'atribui-pedido',
    loadChildren: () => import('./pages/EmpresaTransportes/atribui-pedido/atribui-pedido.module').then( m => m.AtribuiPedidoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Empresa Transportes' }
  },
  {
    path: 'cria-percurso',
    loadChildren: () => import('./pages/Peregrino/cria-percurso/cria-percurso.module').then( m => m.CriaPercursoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Peregrino' }
  },
  {
    path: 'gere-percurso',
    loadChildren: () => import('./pages/Peregrino/gere-percurso/gere-percurso.module').then( m => m.GerePercursoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Peregrino' }
  },
  {
    path: 'gere-grupo',
    loadChildren: () => import('./pages/Peregrino/gere-grupo/gere-grupo.module').then( m => m.GereGrupoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Peregrino' }
  },
  {
    path: 'cria-grupo',
    loadChildren: () => import('./pages/Peregrino/cria-grupo/cria-grupo.module').then( m => m.CriaGrupoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Peregrino' }
  },
  {
    path: 'edita-grupo',
    loadChildren: () => import('./pages/Peregrino/edita-grupo/edita-grupo.module').then( m => m.EditaGrupoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Peregrino' }
  },
  {
    path: 'lista-mochilas',
    loadChildren: () => import('./pages/Peregrino/lista-mochilas/lista-mochilas.module').then( m => m.ListaMochilasPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Peregrino' }
  },
  {
    path: 'cria-recolha-cliente',
    loadChildren: () => import('./pages/Establecimentos/cria-recolha-cliente/cria-recolha-cliente.module').then( m => m.CriaRecolhaClientePageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: ['Dono Estabelecimento', 'Empregado Estabelecimento'] }
  },
  {
    path: 'cria-recolha-estafeta',
    loadChildren: () => import('./pages/Establecimentos/cria-recolha-estafeta/cria-recolha-estafeta.module').then( m => m.CriaRecolhaEstafetaPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: ['Dono Estabelecimento', 'Empregado Estabelecimento'] }
  },
  {
    path: 'cria-entrega-estafeta',
    loadChildren: () => import('./pages/Establecimentos/cria-entrega-estafeta/cria-entrega-estafeta.module').then( m => m.CriaEntregaEstafetaPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: ['Dono Estabelecimento', 'Empregado Estabelecimento'] }
  },
  {
    path: 'cria-entrega-cliente',
    loadChildren: () => import('./pages/Establecimentos/cria-entrega-cliente/cria-entrega-cliente.module').then( m => m.CriaEntregaClientePageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: ['Dono Estabelecimento', 'Empregado Estabelecimento'] }
  },
  {
    path: 'regista-mochila',
    loadChildren: () => import('./pages/Establecimentos/regista-mochila/regista-mochila.module').then( m => m.RegistaMochilaPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: ['Dono Estabelecimento', 'Empregado Estabelecimento'] }
  },
  {
    path: 'lista-localizacoes',
    loadChildren: () => import('./pages/Establecimentos/lista-localizacoes/lista-localizacoes.module').then( m => m.ListaLocalizacoesPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Estabelecimento' }
  },
  {
    path: 'cria-localizacao',
    loadChildren: () => import('./pages/Establecimentos/cria-localizacao/cria-localizacao.module').then( m => m.CriaLocalizacaoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Estabelecimento' }
  },
  {
    path: 'edita-localizacao',
    loadChildren: () => import('./pages/Establecimentos/edita-localizacao/edita-localizacao.module').then( m => m.EditaLocalizacaoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Estabelecimento' }
  },
  {
    path: 'lista-empregados',
    loadChildren: () => import('./pages/Establecimentos/lista-empregados/lista-empregados.module').then( m => m.ListaEmpregadosPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Estabelecimento' }
  },
  {
    path: 'cria-empregado',
    loadChildren: () => import('./pages/Establecimentos/cria-empregado/cria-empregado.module').then( m => m.CriaEmpregadoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Estabelecimento' }
  },
  {
    path: 'edita-empregado',
    loadChildren: () => import('./pages/Establecimentos/edita-empregado/edita-empregado.module').then( m => m.EditaEmpregadoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Estabelecimento' }
  },
  {
    path: 'cria-contas',
    loadChildren: () => import('./pages/Admin/cria-contas/cria-contas.module').then( m => m.CriaContasPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Admin' }
  },
  

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

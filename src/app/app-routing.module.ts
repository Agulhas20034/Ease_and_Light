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
    data: { requiredRole: 'Dono Empresa Transportes', titleKey: 'add_employee' }
  },
  {
    path: 'lista-funcionarios',
    loadChildren: () => import('./pages/EmpresaTransportes/lista-funcionarios/lista-funcionarios.module').then( m => m.ListaFuncionariosPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Empresa Transportes', titleKey: 'employees_list' }
  },
  {
    path: 'edita-funcionario',
    loadChildren: () => import('./pages/EmpresaTransportes/edita-funcionario/edita-funcionario.module').then( m => m.EditaFuncionarioPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Empresa Transportes', titleKey: 'edit_employee' }
  },
  
  {
    path: 'lista-pedidos',
    loadChildren: () => import('./pages/EmpresaTransportes/lista-pedidos/lista-pedidos.module').then( m => m.ListaPedidosPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Empresa Transportes', titleKey: 'list_requests' }
  },
  {
    path: 'atribui-pedido',
    loadChildren: () => import('./pages/EmpresaTransportes/atribui-pedido/atribui-pedido.module').then( m => m.AtribuiPedidoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Empresa Transportes', titleKey: 'assign_requests' }
  },
  {
    path: 'gere-empresas',
    loadChildren: () => import('./pages/EmpresaTransportes/gere-empresas/gere-empresas.module').then(m => m.GereEmpresasPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Empresa Transportes', titleKey: 'companies_list' }
  },
  {
    path: 'cria-empresa',
    loadChildren: () => import('./pages/EmpresaTransportes/cria-empresa/cria-empresa.module').then(m => m.CriaEmpresaPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Empresa Transportes', titleKey: 'create_company' }
  },
  {
    path: 'edita-empresa',
    loadChildren: () => import('./pages/EmpresaTransportes/edita-empresa/edita-empresa.module').then(m => m.EditaEmpresaPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Empresa Transportes', titleKey: 'edit_company' }
  },
  {
    path: 'cria-percurso',
    loadChildren: () => import('./pages/Peregrino/cria-percurso/cria-percurso.module').then( m => m.CriaPercursoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Peregrino', titleKey: 'create_route' }
  },
  {
    path: 'gere-percurso',
    loadChildren: () => import('./pages/Peregrino/gere-percurso/gere-percurso.module').then( m => m.GerePercursoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Peregrino', titleKey: 'manage_routes' }
  },
  {
    path: 'gere-grupo',
    loadChildren: () => import('./pages/Peregrino/gere-grupo/gere-grupo.module').then( m => m.GereGrupoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Peregrino', titleKey: 'manage_groups' }
  },
  {
    path: 'cria-grupo',
    loadChildren: () => import('./pages/Peregrino/cria-grupo/cria-grupo.module').then( m => m.CriaGrupoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Peregrino', titleKey: 'create_group' }
  },
  {
    path: 'edita-grupo',
    loadChildren: () => import('./pages/Peregrino/edita-grupo/edita-grupo.module').then( m => m.EditaGrupoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Peregrino', titleKey: 'edit_group' }
  },
  {
    path: 'lista-mochilas',
    loadChildren: () => import('./pages/Peregrino/lista-mochilas/lista-mochilas.module').then( m => m.ListaMochilasPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Peregrino', titleKey: 'list_backpacks' }
  },
  {
    path: 'cria-recolha-cliente',
    loadChildren: () => import('./pages/Establecimentos/cria-recolha-cliente/cria-recolha-cliente.module').then( m => m.CriaRecolhaClientePageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: ['Dono Estabelecimento', 'Empregado Estabelecimento'], titleKey: 'create_collection_client' }
  },
  {
    path: 'cria-recolha-estafeta',
    loadChildren: () => import('./pages/Establecimentos/cria-recolha-estafeta/cria-recolha-estafeta.module').then( m => m.CriaRecolhaEstafetaPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: ['Dono Estabelecimento', 'Empregado Estabelecimento'], titleKey: 'create_collection_courier' }
  },
  {
    path: 'cria-entrega-estafeta',
    loadChildren: () => import('./pages/Establecimentos/cria-entrega-estafeta/cria-entrega-estafeta.module').then( m => m.CriaEntregaEstafetaPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: ['Dono Estabelecimento', 'Empregado Estabelecimento'], titleKey: 'create_delivery_courier' }
  },
  {
    path: 'cria-entrega-cliente',
    loadChildren: () => import('./pages/Establecimentos/cria-entrega-cliente/cria-entrega-cliente.module').then( m => m.CriaEntregaClientePageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: ['Dono Estabelecimento', 'Empregado Estabelecimento'], titleKey: 'create_delivery_client' }
  },
  {
    path: 'regista-mochila',
    loadChildren: () => import('./pages/Establecimentos/regista-mochila/regista-mochila.module').then( m => m.RegistaMochilaPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: ['Dono Estabelecimento', 'Empregado Estabelecimento'], titleKey: 'register_backpack' }
  },
  {
    path: 'lista-localizacoes',
    loadChildren: () => import('./pages/Establecimentos/lista-localizacoes/lista-localizacoes.module').then( m => m.ListaLocalizacoesPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Estabelecimento', titleKey: 'locations_list' }
  },
  {
    path: 'cria-localizacao',
    loadChildren: () => import('./pages/Establecimentos/cria-localizacao/cria-localizacao.module').then( m => m.CriaLocalizacaoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Estabelecimento', titleKey: 'create_location' }
  },
  {
    path: 'edita-localizacao',
    loadChildren: () => import('./pages/Establecimentos/edita-localizacao/edita-localizacao.module').then( m => m.EditaLocalizacaoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Estabelecimento', titleKey: 'edit_location' }
  },
  {
    path: 'lista-empregados',
    loadChildren: () => import('./pages/Establecimentos/lista-empregados/lista-empregados.module').then( m => m.ListaEmpregadosPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Estabelecimento', titleKey: 'employees_list' }
  },
  {
    path: 'cria-empregado',
    loadChildren: () => import('./pages/Establecimentos/cria-empregado/cria-empregado.module').then( m => m.CriaEmpregadoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Estabelecimento', titleKey: 'create_employee' }
  },
  {
    path: 'edita-empregado',
    loadChildren: () => import('./pages/Establecimentos/edita-empregado/edita-empregado.module').then( m => m.EditaEmpregadoPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Dono Estabelecimento', titleKey: 'edit_employee' }
  },
  {
    path: 'cria-contas',
    loadChildren: () => import('./pages/Admin/cria-contas/cria-contas.module').then( m => m.CriaContasPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Administrador', titleKey: 'create_accounts' }
  },
  {
    path: 'gere-contas',
    loadChildren: () => import('./pages/Admin/gere-contas/gere-contas.module').then( m => m.GereContasPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Administrador', titleKey: 'manage_accounts' }
  },
  {
    path: 'edita-conta',
    loadChildren: () => import('./pages/Admin/edita-conta/edita-conta.module').then(m => m.EditaContaPageModule),
    canActivate: [RoleGuard],
    data: { requiredRole: 'Administrador', titleKey: 'edit_account' }
  },  {
    path: 'gere-veiculos',
    loadChildren: () => import('./pages/EmpresaTransportes/gere-veiculos/gere-veiculos.module').then( m => m.GereVeiculosPageModule)
  },
  {
    path: 'cria-veiculo',
    loadChildren: () => import('./pages/EmpresaTransportes/cria-veiculo/cria-veiculo.module').then( m => m.CriaVeiculoPageModule)
  },
  {
    path: 'edita-veiculo',
    loadChildren: () => import('./pages/EmpresaTransportes/edita-veiculo/edita-veiculo.module').then( m => m.EditaVeiculoPageModule)
  },
  {
    path: 'gere-pedidos',
    loadChildren: () => import('./pages/EmpresaTransportes/gere-pedidos/gere-pedidos.module').then( m => m.GerePedidosPageModule)
  },

  

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

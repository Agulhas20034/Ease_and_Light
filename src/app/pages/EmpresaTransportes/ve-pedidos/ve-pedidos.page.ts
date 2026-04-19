import { Component, OnInit } from '@angular/core';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-ve-pedidos',
  templateUrl: './ve-pedidos.page.html',
  styleUrls: ['./ve-pedidos.page.scss'],
  standalone: false,
})
export class VePedidosPage implements OnInit {
  public pedidos: any[] = [];
  public loading = false;
  public userRole: string = '';
  public userName: string = '';

  constructor(
    private httpApi: HttpApiService,
    private router: Router,
    private toastCtrl: ToastController,
    public t: TranslationService
  ) {}

  ngOnInit() {
    this.loadPedidos();
  }

  ionViewWillEnter() {
    this.loadPedidos();
  }

  async loadPedidos() {
    this.loading = true;
    try {
      const raw = localStorage.getItem('currentUser');
      const user = raw ? JSON.parse(raw) : null;

      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      const role = (user.profileType || user.id_tipo || '').toString();
      const userId = user.id_utilizador || user.id;

      this.userRole = role;
      this.userName = user.nome || user.email || 'User';

      

      const all: any = await this.httpApi.getAllEntregasRecolhas();
      const rows = Array.isArray(all) ? all : (all?.data || []);

      let filtered: any[] = [];

      if (role === 'Administrador') {
        filtered = rows || [];
      } else if (role === 'Dono Empresa Transportes') {
        const empresas: any = await this.httpApi.getUserEmpresas(Number(userId));
        const empresaRows = Array.isArray(empresas) ? empresas : (empresas?.data || []);
        const myEmpresaIds = empresaRows.map((e: any) => Number(e.id_empresa)).filter(Boolean);

        filtered = (rows || []).filter((r: any) => {
          const empresaId = Number(r.id_empresa ?? r.empresa_id ?? r.id_emp ?? 0);
          return myEmpresaIds.includes(empresaId);
        });
      } else if (role === 'Estafeta Empresa Transportes') {
        filtered = (rows || []).filter((r: any) => {
          const estafetaId = Number(r.id_estafeta ?? r.id_entregador ?? r.id_estafeta_e ?? r.id_estafeta_entrega ?? 0);
          return estafetaId === Number(userId);
        });
      }

      this.pedidos = filtered.sort((a, b) => {
        const aTime = new Date(a.data_criacao || a.created_at || '').getTime();
        const bTime = new Date(b.data_criacao || b.created_at || '').getTime();
        return bTime - aTime;
      });

      await this.enrichPedidosWithDetails(this.pedidos);

    } catch (e) {
      console.error('Erro ao carregar pedidos', e);
      const t = await this.toastCtrl.create({
        message: this.t.translate('load_error') || 'Erro ao carregar',
        duration: 2000,
        color: 'danger'
      });
      t.present();
    } finally {
      this.loading = false;
    }
  }

  getEstadoLabel(estado: any): string {
    const e = Number(estado);
    const labels: { [key: number]: string } = {
      1: this.t.translate('pending') || 'Pendente',
      2: this.t.translate('assigned') || 'Atribuído',
      3: this.t.translate('in_progress') || 'Em Andamento',
      4: this.t.translate('delivered') || 'Entregue'
    };
    return labels[e] || `Estado ${e}`;
  }

  getEstadoColor(estado: any): string {
    const e = Number(estado);
    const colors: { [key: number]: string } = {
      1: 'warning',
      2: 'primary',
      3: 'secondary',
      4: 'success'
    };
    return colors[e] || 'medium';
  }

  refreshPedidos() {
    this.loadPedidos();
  }

  canAttributeOrder(pedido: any): boolean {
    const status = Number(pedido.id_estado_entrega_recolha ?? pedido.estado ?? pedido.status ?? 0);
    
    if (this.userRole === 'Estafeta Empresa Transportes') {
      return false;
    }
    
    return status === 1;
  }

  verDetalhes(pedido: any) {
    const id = pedido.id_entrega_recolha || pedido.id;
    if (id) {
      this.router.navigate(['/atribui-pedido'], { queryParams: { id } });
    }
  }

  private async enrichPedidosWithDetails(pedidos: any[]) {
    try {
      const empresaIds = new Set<number>();
      const localizacaoIds = new Set<number>();

      pedidos.forEach((p) => {
        const empresaId = Number(p.id_empresa ?? p.empresa_id ?? p.id_emp ?? 0);
        if (empresaId) empresaIds.add(empresaId);

        const locRecolhaId = Number(p.id_estabelecimento_r ?? p.id_localizacao_recolha ?? p.id_local_recolha ?? 0);
        const locEntregaId = Number(p.id_estabelecimento_e ?? p.id_localizacao_entrega ?? p.id_local_entrega ?? 0);
        if (locRecolhaId) localizacaoIds.add(locRecolhaId);
        if (locEntregaId) localizacaoIds.add(locEntregaId);
      });

      const empresasMap = new Map<number, any>();
      const localizacoesMap = new Map<number, any>();

      if (empresaIds.size > 0) {
        const allEmpresas: any = await this.httpApi.getAllEmpresaTransportes();
        const empresaRows = Array.isArray(allEmpresas) ? allEmpresas : (allEmpresas?.data || []);
        empresaRows.forEach((e: any) => {
          empresasMap.set(Number(e.id_empresa), e);
        });
      }

      if (localizacaoIds.size > 0) {
        for (const locId of Array.from(localizacaoIds)) {
          try {
            const loc: any = await this.httpApi.getLocalizacao(locId);
            if (loc) {
              localizacoesMap.set(locId, Array.isArray(loc) ? loc[0] : loc);
            }
          } catch (e) {
            console.warn(`Could not fetch location ${locId}`, e);
          }
        }
      }

      pedidos.forEach((p) => {
        const empresaId = Number(p.id_empresa ?? p.empresa_id ?? p.id_emp ?? 0);
        if (empresaId && empresasMap.has(empresaId)) {
          const empresa = empresasMap.get(empresaId);
          p.nome_empresa = empresa.nome || empresa.nome_empresa || p.nome_empresa;
        }

        const locRecolhaId = Number(p.id_estabelecimento_r ?? p.id_localizacao_recolha ?? p.id_local_recolha ?? 0);
        if (locRecolhaId && localizacoesMap.has(locRecolhaId)) {
          const loc = localizacoesMap.get(locRecolhaId);
          p.estab_nome_r = loc.nome_rua || loc.nome || loc.name || p.estab_nome_r;
        }

        const locEntregaId = Number(p.id_estabelecimento_e ?? p.id_localizacao_entrega ?? p.id_local_entrega ?? 0);
        if (locEntregaId && localizacoesMap.has(locEntregaId)) {
          const loc = localizacoesMap.get(locEntregaId);
          p.estab_nome_e = loc.nome_rua || loc.nome || loc.name || p.estab_nome_e;
        }
      });
    } catch (e) {
      console.error('Erro ao enriquecer dados dos pedidos', e);
    }
  }
}

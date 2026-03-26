import { Component, OnInit } from '@angular/core';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-gere-pedidos',
  templateUrl: './gere-pedidos.page.html',
  styleUrls: ['./gere-pedidos.page.scss'],
  standalone: false,
})
export class GerePedidosPage implements OnInit {
  public pedidos: any[] = [];
  public loading = false;

  constructor(
    private httpApi: HttpApiService,
    private router: Router,
    private toastCtrl: ToastController,
    public t: TranslationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadPedidos();
  }

  async loadPedidos() {
    this.loading = true;
    try {
      const raw = localStorage.getItem('currentUser');
      const user = raw ? JSON.parse(raw) : null;
      const role = user && (user.profileType || user.id_tipo) ? (user.profileType || user.id_tipo).toString() : '';

      const qp = this.route.snapshot.queryParams || {};
      const empresaParam = qp['id'] ?? qp['empresaId'] ?? null;
      const empresaFilterId = empresaParam ? Number(empresaParam) : null;

      const all: any = await this.httpApi.getAllEntregasRecolhas();
      const rows = Array.isArray(all) ? all : (all?.data || []);

      // selecionar entregas que têm id_empresa e não têm veiculo/estafeta atribuídos
      let filtered = (rows || []).filter((r: any) => {
        const hasEmpresa = r.id_empresa ?? r.empresa_id ?? r.id_emp ?? null;
        const hasVeiculo = r.id_veiculo ?? r.id_veiculo_entrega ?? r.id_veiculo_e ?? r.veiculo_id ?? null;
        const hasEstafeta = r.id_estafeta ?? r.id_entregador ?? r.id_estafeta_e ?? r.id_estafeta_entrega ?? null;
        const estado = r.id_estado_entrega_recolha ?? r.estado ?? r.status ?? null;
        const empresaMatches = empresaFilterId ? Number(hasEmpresa) === Number(empresaFilterId) : (hasEmpresa !== null && hasEmpresa !== undefined);
        // Excluir pedidos já entregues (estado == 4)
        const notDelivered = estado === null || Number(estado) !== 4;
        return empresaMatches && (hasVeiculo === null || hasVeiculo === undefined) && (hasEstafeta === null || hasEstafeta === undefined) && notDelivered;
      });

      if (!empresaFilterId) {
        if (role === 'Administrador') {
          this.pedidos = filtered;
        } else if (user && user.id_utilizador) {
          const rels: any = await this.httpApi.getUserEmpresas(Number(user.id_utilizador));
          const relRows = Array.isArray(rels) ? rels : (rels?.data || []);
          const myEmpresaIds = relRows.map((r: any) => Number(r.id_empresa)).filter(Boolean);
          this.pedidos = filtered.filter((p: any) => myEmpresaIds.includes(Number(p.id_empresa ?? p.empresa_id ?? p.id_emp)));
        } else {
          this.pedidos = [];
        }
      } else {
        // empresaFilterId present -> admins and owners see only that company's pedidos
        this.pedidos = filtered;
      }

    } catch (e) {
      console.error('Erro ao carregar pedidos', e);
      const t = await this.toastCtrl.create({ message: this.t.translate('load_error') || 'Erro ao carregar', duration: 2000, color: 'danger' });
      t.present();
    } finally {
      this.loading = false;
    }
  }

  atribuir(p: any) {
    const entregaId = p.id_entrega_recolha || p.id || p.id_entrega || p.id_recolha;
    const empresaId = p.id_empresa ?? p.empresa_id ?? p.id_emp;
    const qp: any = { id: entregaId };
    if (empresaId) qp.empresaId = empresaId;
    this.router.navigate(['/atribui-pedido'], { queryParams: qp });
  }

}

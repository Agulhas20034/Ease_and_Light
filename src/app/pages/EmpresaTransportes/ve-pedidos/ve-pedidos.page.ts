import { Component, OnInit } from '@angular/core';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-ve-pedidos',
  templateUrl: './ve-pedidos.page.html',
  styleUrls: ['./ve-pedidos.page.scss'],
  standalone: false,
})
export class VePedidosPage implements OnInit {
  public pedidos: any[] = [];
  public allPedidos: any[] = [];
  public loading = false;
  public userRole: string = '';
  public userName: string = '';
  public companies: any[] = [];
  public drivers: any[] = [];
  public statusOptions: any[] = [];
  public filterStatus: number | null = null;
  public filterCompany: number | null = null;
  public filterDriver: number | null = null;
  public filterPeregrino: string = '';
  private estadoDescrCache: Record<number, string> = {};
  private mochilaMap: Map<string, any> = new Map();
  private userById: Map<number, any> = new Map();

  constructor(
    private httpApi: HttpApiService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
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

      const sorted = (filtered || []).sort((a, b) => {
        const aTime = new Date(a.data_criacao || a.created_at || '').getTime();
        const bTime = new Date(b.data_criacao || b.created_at || '').getTime();
        return bTime - aTime;
      });

      this.allPedidos = sorted;

      await this.enrichPedidosWithDetails(this.allPedidos);
      await this.loadEstadoDescriptions(this.allPedidos);

      const allUsersResp: any = await this.httpApi.getAllUsers();
      const allUsers = Array.isArray(allUsersResp) ? allUsersResp : (allUsersResp?.data || []);
      this.userById = new Map(
        allUsers
          .map((u: any): [number, any] => [Number(u.id_utilizador ?? u.id ?? u.id_user ?? 0), u])
          .filter(([key]: [number, any]) => Boolean(key))
      );

      const allMochilasResp: any = await this.httpApi.getAllMochilas();
      const allMochilas = Array.isArray(allMochilasResp) ? allMochilasResp : (allMochilasResp?.data || []);
      this.mochilaMap = new Map(
        allMochilas
          .map((m: any): [string, any] => [String(m.id_mochila ?? m.id ?? ''), m])
          .filter(([key]: [string, any]) => Boolean(key))
      );

      this.applyPeregrinoDetails();

      const statusIds = new Set<number>();
      this.allPedidos.forEach((p: any) => {
        const id = Number(p.id_estado_entrega_recolha ?? p.id_estado ?? p.estado ?? p.status ?? 0);
        if (id) statusIds.add(id);
      });
      this.statusOptions = Array.from(statusIds).map((id) => ({ id, label: this.estadoDescrCache[id] || `Estado ${id}` }));

      try {
        const allCompanies: any = await this.httpApi.getAllEmpresaTransportes();
        this.companies = Array.isArray(allCompanies) ? allCompanies : (allCompanies?.data || []);
      } catch (e) {
        this.companies = [];
      }

      const estafetaIds = new Set<number>();
      this.allPedidos.forEach((p: any) => {
        const id = Number(p.id_estafeta ?? p.id_entregador ?? p.id_estafeta_e ?? p.id_estafeta_entrega ?? 0);
        if (id) estafetaIds.add(id);
      });
      this.drivers = allUsers.filter((u: any) => estafetaIds.has(Number(u.id_utilizador ?? u.id ?? u.id_user ?? 0)));

      this.applyFilters();

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

  getEstadoLabel(pedido: any): string {
    if (pedido?.estadoDescr) {
      return pedido.estadoDescr;
    }

    const estadoId = Number(pedido.id_estado_entrega_recolha ?? pedido.id_estado ?? pedido.estado ?? pedido.status ?? 0);
    const labels: { [key: number]: string } = {
      1: this.t.translate('pending') || 'Pendente',
      2: this.t.translate('assigned') || 'Atribuído',
      3: this.t.translate('in_progress') || 'Em Andamento',
      4: this.t.translate('delivered') || 'Entregue',
      7: this.t.translate('status_refused') || 'Recusado'
    };
    return labels[estadoId] || (estadoId ? `Estado ${estadoId}` : this.t.translate('unknown') || 'Unknown');
  }

  getEstadoColor(pedido: any): string {
    const e = Number(pedido.id_estado_entrega_recolha ?? pedido.id_estado ?? pedido.estado ?? pedido.status ?? 0);
    const colors: { [key: number]: string } = {
      1: 'warning',
      2: 'primary',
      3: 'secondary',
      4: 'success',
      7: 'danger'
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

  canRefuseOrder(pedido: any): boolean {
    const status = Number(pedido.id_estado_entrega_recolha ?? pedido.estado ?? pedido.status ?? 0);
    if (this.userRole === 'Estafeta Empresa Transportes') return false;
    return status === 1;
  }

  async refusePedido(pedido: any) {
    const id = pedido.id_entrega_recolha || pedido.id;
    if (!id) return;

    const confirm = await this.alertCtrl.create({
      header: this.t.translate('confirm_action') || 'Confirmar',
      message: this.t.translate('confirm_refuse') || 'Deseja recusar esta mochila? Isto notificará o peregrino e as contas do local de recolha.',
      buttons: [
        { text: this.t.translate('cancel') || 'Cancelar', role: 'cancel' },
        { text: this.t.translate('yes') || 'Sim', handler: async () => {
          try {
            await this.httpApi.updateEntregaRecolha(Number(id), { estado: 7 });
            const to = await this.toastCtrl.create({ message: this.t.translate('update_success') || 'Atualizado', duration: 1500, color: 'success' });
            to.present();

            try {
              const ordem: any = await this.httpApi.getEntregaRecolha(Number(id));
              let requesterId = Number(ordem?.id_user || ordem?.id_utilizador || ordem?.id_cliente || ordem?.id_solicitante || 0);
              const mochilaId = String(ordem?.id_mochila ?? ordem?.id_mochila_fk ?? ordem?.id_mochila_id ?? '');
              if (!requesterId && mochilaId) {
                const mochila = this.mochilaMap.get(mochilaId);
                requesterId = Number(mochila?.id_user ?? mochila?.id_utilizador ?? 0);
              }

              const empresaId = Number(ordem?.id_empresa || ordem?.empresa_id || 0);
              const empresaRec: any = empresaId ? await this.httpApi.getEmpresaTransportes(empresaId) : null;
              const companyName = empresaRec?.nome || empresaRec?.nome_empresa || empresaRec?.name || '';

              if (requesterId) {
                await this.httpApi.createNotification({
                  userId: requesterId,
                  title: this.t.translate('pickup_refused_user_title') || 'Pickup Refused',
                  description: (this.t.translate('pickup_refused_user_message') || 'The pickup for your backpack was refused by {{companyName}} and will be re-sent.').replace('{{companyName}}', companyName || 'the company'),
                  createdAt: new Date().toISOString()
                });
              }

              const pickupLocId = Number(ordem?.id_estabelecimento_r || ordem?.id_localizacao_recolha || ordem?.id_estab_r || ordem?.id_estabelecimento || 0);
              if (pickupLocId) {
                const locUsers: any[] = await this.httpApi.getUsersByEstabelecimento(pickupLocId);
                const assignedUsers = Array.isArray(locUsers) ? locUsers : [];
                for (const lu of assignedUsers) {
                  const uid = Number(lu?.id_utilizador || lu?.id || 0);
                  if (uid) {
                    await this.httpApi.createNotification({
                      userId: uid,
                      title: this.t.translate('pickup_refused_location_title') || 'Pickup Refused at Location',
                      description: (this.t.translate('pickup_refused_location_message') || 'The pickup at your location was refused by {{companyName}} for backpack {{backpackId}}. Please re-send it.').replace('{{companyName}}', companyName || 'the company').replace('{{backpackId}}', String(ordem?.id_mochila || ordem?.id_mochila_fk || ordem?.id_mochila_id || ordem?.id_mochila || '')),
                      createdAt: new Date().toISOString()
                    });
                  }
                }
              }
            } catch (notifyErr) {
              console.warn('Error sending refuse notifications', notifyErr);
            }

              this.loadPedidos();
          } catch (e) {
            console.error('Erro ao recusar pedido', e);
            const to = await this.toastCtrl.create({ message: this.t.translate('save_error') || 'Erro ao atualizar', duration: 2000, color: 'danger' });
            to.present();
          }
        }}
      ]
    });
    await confirm.present();
  }

  verDetalhes(pedido: any) {
    const id = pedido.id_entrega_recolha || pedido.id;
    if (id) {
      this.router.navigate(['/atribui-pedido'], { queryParams: { id } });
    }
  }

  applyFilters() {
    const status = this.filterStatus ? Number(this.filterStatus) : null;
    const company = this.filterCompany ? Number(this.filterCompany) : null;
    const driver = this.filterDriver ? Number(this.filterDriver) : null;
    const peregrino = (this.filterPeregrino || '').toString().trim().toLowerCase();

    this.pedidos = (this.allPedidos || []).filter((p: any) => {
      if (status && Number(p.id_estado_entrega_recolha ?? p.id_estado ?? p.estado ?? p.status ?? 0) !== status) return false;
      if (company && Number(p.id_empresa ?? p.empresa_id ?? p.id_emp ?? 0) !== company) return false;
      if (driver) {
        const est = Number(p.id_estafeta ?? p.id_entregador ?? p.id_estafeta_e ?? p.id_estafeta_entrega ?? 0);
        if (est !== driver) return false;
      }
      if (peregrino) {
        const vals = (p.peregrinoFilterValue ||
          [p.peregrinoName, p.peregrinoEmail, p.nome, p.nome_peregrino, p.nome_utilizador, p.email, p.user_email, p.nome_cliente, p.utilizador_nome, p.nome_user]
            .filter(Boolean)
            .map((v: any) => String(v).toLowerCase())
            .join(' ')
        );
        if (!vals.includes(peregrino)) return false;
      }
      return true;
    });
  }

  clearFilters() {
    this.filterStatus = null;
    this.filterCompany = null;
    this.filterDriver = null;
    this.filterPeregrino = '';
    this.applyFilters();
  }

  private applyPeregrinoDetails() {
    this.allPedidos.forEach((pedido: any) => {
      const mochilaId = String(pedido.id_mochila ?? pedido.id_mochila_fk ?? pedido.id_mochila_id ?? '');
      const mochila = this.mochilaMap.get(mochilaId);
      const peregrinoUserId = Number(mochila?.id_user ?? mochila?.id_utilizador ?? 0);
      const peregrinoUser = this.userById.get(peregrinoUserId);
      pedido.peregrinoName = (peregrinoUser?.nome || peregrinoUser?.name || pedido.nome_peregrino || pedido.nome_cliente || pedido.nome || '').trim();
      pedido.peregrinoEmail = (peregrinoUser?.email || peregrinoUser?.user_email || pedido.email || pedido.user_email || '').trim();
      pedido.peregrinoFilterValue = [pedido.peregrinoName, pedido.peregrinoEmail]
        .filter(Boolean)
        .map((v: any) => String(v).toLowerCase())
        .join(' ');
    });
  }

  private async loadEstadoDescriptions(pedidos: any[]) {
    const estadoIds = new Set<number>();
    for (const pedido of pedidos) {
      const id = Number(pedido.id_estado_entrega_recolha ?? pedido.id_estado ?? pedido.estado ?? pedido.status ?? 0);
      if (id) estadoIds.add(id);
    }

    for (const id of Array.from(estadoIds)) {
      if (this.estadoDescrCache[id]) {
        continue;
      }
      try {
        const record: any = await this.httpApi.getEstadoEntregaRecolha(id);
        this.estadoDescrCache[id] = record?.descr ?? record?.descricao ?? record?.description ?? record?.estado ?? record?.nome ?? record?.name ?? `Estado ${id}`;
      } catch (err) {
        console.warn(`Failed to load estado_entrega_recolha ${id}`, err);
        this.estadoDescrCache[id] = `Estado ${id}`;
      }
    }

    for (const pedido of pedidos) {
      const id = Number(pedido.id_estado_entrega_recolha ?? pedido.id_estado ?? pedido.estado ?? pedido.status ?? 0);
      if (id) {
        pedido.estadoDescr = this.estadoDescrCache[id];
      }
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

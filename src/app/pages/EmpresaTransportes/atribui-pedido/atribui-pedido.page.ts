import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { ToastController, AlertController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-atribui-pedido',
  templateUrl: './atribui-pedido.page.html',
  styleUrls: ['./atribui-pedido.page.scss'],
  standalone: false,
})
export class AtribuiPedidoPage implements OnInit {
  public entregaId: number | null = null;
  public empresaId: number | null = null;
  public empresas: any[] = [];
  public employees: any[] = [];
  public vehicles: any[] = [];
  public selectedEmployee: any = null;
  public selectedVehicle: any = null;
  public loading = false;

  constructor(
    private route: ActivatedRoute,
    private httpApi: HttpApiService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    public t: TranslationService
  ) {}

  ngOnInit() {
    const q = this.route.snapshot.queryParams || {};
    if (q['id']) this.entregaId = Number(q['id']);
    if (q['empresaId']) this.empresaId = Number(q['empresaId']);
    this.loadInitial();
  }

  isCompanyLocked(): boolean {
    return this.entregaId !== null && this.entregaId > 0;
  }

  async loadInitial() {
    this.loading = true;
    try {
      if (this.entregaId && this.entregaId > 0) {
        const ordem: any = await this.httpApi.getEntregaRecolha(this.entregaId);
        if (ordem) {
          this.empresaId = Number(ordem.id_empresa);
        }
      }

      // carregar empresas se admin 
      const raw = localStorage.getItem('currentUser');
      const user = raw ? JSON.parse(raw) : null;
      const role = user && (user.profileType || user.id_tipo) ? (user.profileType || user.id_tipo).toString() : '';

      if (role === 'Administrador') {
        const all: any = await this.httpApi.getAllEmpresaTransportes();
        this.empresas = Array.isArray(all) ? all : (all?.data || []);
      } else if (user && user.id_utilizador) {
        const rels: any = await this.httpApi.getUserEmpresas(Number(user.id_utilizador));
        const relRows = Array.isArray(rels) ? rels : (rels?.data || []);
        const ids = relRows.map((r: any) => Number(r.id_empresa)).filter(Boolean);
        const all: any = await this.httpApi.getAllEmpresaTransportes();
        const rows = Array.isArray(all) ? all : (all?.data || []);
        this.empresas = rows.filter((c: any) => ids.includes(Number(c.id_empresa)));
      }

      if (this.empresaId && this.empresaId > 0) {
        await this.loadEmployeesAndVehicles(this.empresaId);
      }

    } catch (e) {
      console.error('Erro ao inicializar atribui-pedido', e);
      const t = await this.toastCtrl.create({ message: this.t.translate('load_error') || 'Erro ao carregar', duration: 2000, color: 'danger' });
      t.present();
    } finally {
      this.loading = false;
    }
  }

  async loadEmployeesAndVehicles(companyId: number | null) {
    this.loading = true;
    try {
      if (!companyId) {
        this.employees = [];
        this.vehicles = [];
        this.empresaId = null;
        return;
      }
      this.empresaId = Number(companyId);
      const [rels, usersResp, veics]: any = await Promise.all([
        this.httpApi.fetchAll('users_empresa_transportes'),
        this.httpApi.getAllUsers(),
        this.httpApi.getVeiculosByEmpresa(Number(companyId))
      ]);
      const relRows = Array.isArray(rels) ? rels : (rels?.data || []);
      const userRows = Array.isArray(usersResp) ? usersResp : (usersResp?.data || []);
      const assigned = relRows.filter((r: any) => Number(r.id_empresa) === Number(companyId));
      this.employees = assigned.map((a: any) => userRows.find((u: any) => Number(u.id_utilizador) === Number(a.id_utilizador))).filter(Boolean);
      const veicRows = Array.isArray(veics) ? veics : (veics?.data || []);
      this.vehicles = veicRows;
    } catch (e) {
      console.error('Erro ao carregar empregados/veiculos', e);
    } finally {
      this.loading = false;
    }
  }

  async assign() {
    if (!this.entregaId) return;
    if (!this.selectedEmployee || !this.selectedVehicle) {
      const t = await this.toastCtrl.create({ message: this.t.translate('select_employee_vehicle') || 'Selecione funcionário e veículo', duration: 2000, color: 'warning' });
      t.present();
      return;
    }

    const confirm = await this.alertCtrl.create({
      header: this.t.translate('confirm_action') || 'Confirmar',
      message: this.t.translate('confirm_assign') || 'Deseja atribuir este pedido?',
      buttons: [
        { text: this.t.translate('cancel') || 'Cancelar', role: 'cancel' },
        { text: this.t.translate('yes') || 'Sim', handler: async () => {
          try {
            const veicId = this.selectedVehicle.matricula ?? this.selectedVehicle.id ?? this.selectedVehicle['matricula'];
            const empId = this.selectedEmployee.id_utilizador ?? this.selectedEmployee.id;
            const updates: any = {
              id_veiculo: veicId,
              id_estafeta: empId,
              estado: 2,
            };
            await this.httpApi.updateEntregaRecolha(Number(this.entregaId), updates);
            const to = await this.toastCtrl.create({ message: this.t.translate('update_success') || 'Atualizado', duration: 1500, color: 'success' });
            to.present();
            try {
              const ordem: any = await this.httpApi.getEntregaRecolha(Number(this.entregaId));
              const requesterId = Number(ordem?.id_user || ordem?.id_utilizador || ordem?.id_cliente || ordem?.id_solicitante || 0);
              const empresaId = Number(this.empresaId || ordem?.id_empresa || ordem?.empresa_id || 0);
              const empresaRec: any = empresaId ? await this.httpApi.getEmpresaTransportes(empresaId) : null;
              const companyName = empresaRec?.nome || empresaRec?.nome_empresa || empresaRec?.name || '';
              if (requesterId) {
                await this.httpApi.createNotification({
                  userId: requesterId,
                  title: this.t.translate('pickup_accepted_user_title') || 'Pickup Accepted',
                  description: (this.t.translate('pickup_accepted_user_message') || 'The pickup for your backpack has been accepted by {{companyName}}.').replace('{{companyName}}', companyName || 'the company'),
                  createdAt: new Date().toISOString()
                });
              }
              const pickupLocId = Number(ordem?.id_estabelecimento_r || ordem?.id_localizacao_recolha || ordem?.id_estab_r || 0);
              if (pickupLocId) {
                const locUsers: any[] = await this.httpApi.getUsersByEstabelecimento(pickupLocId);
                const assignedUsers = Array.isArray(locUsers) ? locUsers : [];
                for (const lu of assignedUsers) {
                  const uid = Number(lu?.id_utilizador || lu?.id || 0);
                  if (uid) {
                    await this.httpApi.createNotification({
                      userId: uid,
                      title: this.t.translate('pickup_accepted_location_title') || 'Pickup Accepted at Location',
                      description: (this.t.translate('pickup_accepted_location_message') || 'The pickup at your location has been accepted by {{companyName}} for backpack {{backpackId}}.').replace('{{companyName}}', companyName || 'the company').replace('{{backpackId}}', String(ordem?.id_mochila || ordem?.id_mochila_fk || ordem?.id_mochila_id || ordem?.id_mochila || '')),
                      createdAt: new Date().toISOString()
                    });
                  }
                }
              }
            } catch (notifyErr) {
              console.warn('Error sending accept notifications', notifyErr);
            }
            this.router.navigateByUrl('/folder/inbox');
          } catch (e) {
            console.error('Erro ao atribuir pedido', e);
            const to = await this.toastCtrl.create({ message: this.t.translate('save_error') || 'Erro ao atualizar', duration: 2000, color: 'danger' });
            to.present();
          }
        }}
      ]
    });
    await confirm.present();
  }

}

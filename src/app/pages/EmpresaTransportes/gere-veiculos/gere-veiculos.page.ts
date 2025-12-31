import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase/supabase';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-gere-veiculos',
  templateUrl: './gere-veiculos.page.html',
  styleUrls: ['./gere-veiculos.page.scss'],
  standalone: false,
})
export class GereVeiculosPage implements OnInit {
  vehicles: any[] = [];
  loading = false;
  companyId: number | null = null;
  companyName: string | null = null;
  companyParamKey: string | null = null;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    public t: TranslationService
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    const q = this.route.snapshot.queryParams || {};
    // detectar qual a chave usada (manter o nome usado pelo remetente)
    const keys = ['id', 'id_empresa', 'companyId'];
    let foundKey: string | null = null;
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(q, k) && q[k] != null) { foundKey = k; break; }
    }
    this.companyParamKey = foundKey || 'id';
    const id = foundKey ? q[foundKey] : null;
    this.companyId = id ? Number(id) : null;
    // carregar nome da empresa para mostrar no título (evitar mostrar name+id)
    if (this.companyId) this.loadCompanyName(this.companyId);
    this.loadVehicles(this.companyId);
  }

  /** Busca o registo da empresa e extrai o nome para exibição no cabeçalho */
  private async loadCompanyName(id: number) {
    try {
      const data: any = await this.supabase.getEmpresaTransportes(Number(id));
      const c = data || (data?.data && data.data[0]) || {};
      this.companyName = c.nome;
    } catch (e) {
      console.warn('Failed to load company name', e);
      this.companyName = null;
    }
  }

  /**
   * Carrega os veículos da empresa (por id de empresa). Se não houver id,
   * apresenta uma mensagem e mantém a lista vazia.
   */
  async loadVehicles(companyId: number | null) {
    this.loading = true;
    try {
      if (!companyId) {
        this.vehicles = [];
        const toast = await this.toastCtrl.create({ message: this.t.translate('no_vehicles'), duration: 1800, color: 'warning' });
        toast.present();
        return;
      }

      // carregar veículos e tipos para mostrar a descrição do tipo
      const [data, tiposData]: any = await Promise.all([
        this.supabase.getVeiculosByEmpresa(Number(companyId)),
        this.supabase.getAllTipoVeiculo()
      ]);
      const rows = Array.isArray(data) ? data : (data?.data || []);
      const tiposRows = Array.isArray(tiposData) ? tiposData : (tiposData?.data || []);
      const tiposById: Record<string, any> = {};
      for (const tp of tiposRows) {
        const key = tp.id_tipo || tp.id || tp['id_tipo'];
        tiposById[String(key)] = tp;
      }
      this.vehicles = rows.map((v: any) => ({
        ...(v || {}),
        _expanded: false,
        tipo_descr: (v && (tiposById[String(v.id_tipo)]?.descr || tiposById[String(v.id_tipo)]?.descricao || tiposById[String(v.id_tipo)]?.nome || tiposById[String(v.id_tipo)]?.displayName)) || v.tipo || v.tipo_veiculo || '-'
      }));
    } catch (e) {
      console.error('Failed to load vehicles', e);
      const t = await this.toastCtrl.create({ message: this.t.translate('loading_failed'), duration: 2000, color: 'danger' });
      t.present();
    } finally {
      this.loading = false;
    }
  }

  create() {
    const paramName = this.companyParamKey || 'id';
    const qp: any = {};
    qp[paramName] = this.companyId;
    this.router.navigate(['/cria-veiculo'], { queryParams: qp });
  }

  edit(v: any) {
    const key = v.matricula || v['matricula'];
    this.router.navigate(['/edita-veiculo'], { queryParams: { matricula: key } });
  }

  /** Alterna o estado expandido de um veículo para mostrar ações */
  toggleExpand(v: any) {
    v._expanded = !v._expanded;
  }

  /** Confirmação e ação para alternar ativo/inativo (1 <-> 2) */
  async confirmToggleVehicle(v: any) {
    const matricula = v.matricula || v['matricula'];
    const isActive = v.estado === 1;
    const header = isActive ? this.t.translate('deactivate') : this.t.translate('activate_account');
    const actionText = isActive ? this.t.translate('deactivate') : this.t.translate('activate_account');
    const newEstado = isActive ? 2 : 1;
    const alert = await this.alertCtrl.create({
      header,
      message: this.t.translate('confirm_delete'),
      buttons: [
        { text: this.t.translate('cancel'), role: 'cancel' },
        { text: actionText, handler: () => this.updateVehicleEstado(matricula, newEstado) }
      ]
    });
    await alert.present();
  }

  /** Confirmação e ação para descontinuar (estado -> 3). Após 3, ações não aparecem. */
  async confirmDescontinueVehicle(v: any) {
    const matricula = v.matricula || v['matricula'];
    const alert = await this.alertCtrl.create({
      header: this.t.translate('vehicle_discontinued'),
      message: this.t.translate('confirm_delete'),
      buttons: [
        { text: this.t.translate('cancel'), role: 'cancel' },
        { text: this.t.translate('vehicle_discontinued'), handler: () => this.updateVehicleEstado(matricula, 3) }
      ]
    });
    await alert.present();
  }

  /** Atualiza o estado do veículo na base de dados e recarrega a lista */
  private async updateVehicleEstado(matricula: any, newEstado: number) {
    try {
      await this.supabase.updateVeiculo(matricula, { estado: newEstado });
      const toast = await this.toastCtrl.create({ message: this.t.translate(newEstado === 3 ? 'vehicle_discontinued' : 'vehicle_inactive'), duration: 1500, color: 'success' });
      toast.present();
      this.loadVehicles(this.companyId);
    } catch (e) {
      console.error('Failed to update vehicle estado', e);
      const t = await this.toastCtrl.create({ message: this.t.translate('toggle_error'), duration: 2000, color: 'danger' });
      t.present();
    }
  }

}

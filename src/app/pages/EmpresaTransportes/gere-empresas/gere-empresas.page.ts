import { Component, OnInit } from '@angular/core';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { Router } from '@angular/router';
import { ToastController, AlertController, ModalController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';
import { DeliveryHistoryModalComponent } from '../../../components/delivery-history-modal/delivery-history-modal.component';

@Component({
  selector: 'app-gere-empresas',
  templateUrl: './gere-empresas.page.html',
  styleUrls: ['./gere-empresas.page.scss'],
  standalone: false,
})
export class GereEmpresasPage implements OnInit {
  companies: any[] = [];
  loading = false;

  constructor(
    private httpApi: HttpApiService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    public t: TranslationService
  ) {}

  ngOnInit() {
    this.loadCompanies();
  }

  private async enrichCompaniesWithOwnerEmail(companies: any[]) {
    try {
      const rels: any = await this.httpApi.fetchAll('users_empresa_transportes');
      const relRows = Array.isArray(rels) ? rels : (rels?.data || []);
      const users: any = await this.httpApi.fetchAll('users');
      const userRows = Array.isArray(users) ? users : (users?.data || []);

      const usersById: Record<string, any> = {};
      for (const u of userRows) {
        if (u && u.id_utilizador) usersById[String(u.id_utilizador)] = u;
      }

      for (const comp of companies) {
        if (!comp) continue;
        if (comp.email) continue; 
        const id = comp.id_empresa || comp['id'] || comp.idEmpresa;
        if (!id) continue;
        const assigned = relRows.filter((r: any) => Number(r.id_empresa) === Number(id));
        if (assigned && assigned.length > 0) {
          const first = assigned[0];
          const user = usersById[String(first.id_utilizador)];
          if (user && user.email) comp.email = user.email;
        }
      }
    } catch (e) {
      console.warn('Failed to enrich companies with owner email', e);
    }
  }

  ionViewWillEnter() {
    this.loadCompanies();
  }

  async loadCompanies() {
    this.loading = true;
    try {
      const raw = localStorage.getItem('currentUser');
      const user = raw ? JSON.parse(raw) : null;
      const role = (user && (user.profileType || user.id_tipo) ? (user.profileType || user.id_tipo).toString() : '');
      if (role === 'Administrador') {
        const data: any = await this.httpApi.getAllEmpresaTransportes();
        const rawCompanies = Array.isArray(data) ? data : (data?.data || []);
        this.companies = rawCompanies.map((c: any) => ({
          ...(c || {}),
          nome: c.nome,
          nif: c.nif,
          email: c.email,
          _expanded: false
        }));
        await this.enrichCompaniesWithOwnerEmail(this.companies);
      } else if (user && user.id_utilizador) {
        const rels: any = await this.httpApi.getUserEmpresas(Number(user.id_utilizador));
        const relRows = Array.isArray(rels) ? rels : (rels?.data || []);
        const ids = relRows.map((r: any) => Number(r.id_empresa)).filter((v: any) => !!v);
        const companies: any[] = [];
        for (const id of ids) {
          try {
            const c: any = await this.httpApi.getEmpresaTransportes(Number(id));
            if (c) companies.push(c);
          } catch (e) {
            console.warn('Failed to load company', id, e);
          }
        }
        this.companies = companies.map((c: any) => ({
          ...(c || {}),
          nome: c.nome || c.name || c.nome_empresa || c.razao_social || '',
          nif: c.nif || c.nif_empresa || c.nifEmpresa || null,
          email: c.email || c.email_empresa || c.emailEmpresa || null,
          _expanded: false
        }));
        await this.enrichCompaniesWithOwnerEmail(this.companies);
      } else {
        this.companies = [];
      }
    } catch (e) {
      console.error('Failed to load companies', e);
      const t = await this.toastCtrl.create({ message: this.t.translate('loading_failed'), duration: 2000, color: 'danger' });
      t.present();
    } finally {
      this.loading = false;
    }
  }

  create() {
    this.router.navigate(['/cria-empresa']);
  }

  edit(c: any) {
    this.router.navigate(['/edita-empresa'], { queryParams: { id: c.id_empresa || c['id'] || c.idEmpresa } });
  }
  

  toggleExpand(c: any) {
    c._expanded = !c._expanded;
  }

  
  goToVehicles(c: any) {
    const id = c.id_empresa;
    this.router.navigate(['/gere-veiculos'], { queryParams: { id } });
  }

  
  goToOrders(c: any) {
    const id = c.id_empresa || c['id'] || c.idEmpresa;
    this.router.navigate(['/gere-pedidos'], { queryParams: { id } });
  }
  manageEmployees(c: any) {
    const id = c.id_empresa || c['id'] || c.idEmpresa;
    this.router.navigate(['/lista-funcionarios'], { queryParams: { id } });
  }

  async confirmToggleCompany(c: any) {
    const id = c.id_empresa || c['id'] || c.idEmpresa;
    const isActive = c.estado === 1;
    const header = isActive ? this.t.translate('deactivate_company') : this.t.translate('activate_account');
    const actionText = isActive ? this.t.translate('deactivate_company') : this.t.translate('activate_account');
    const alert = await this.alertCtrl.create({
      header,
      message: this.t.translate('confirm_delete'),
      buttons: [
        { text: this.t.translate('cancel'), role: 'cancel' },
        { text: actionText, handler: () => this.toggleCompany(id, !isActive) }
      ]
    });
    await alert.present();
  }

  async toggleCompany(id: any, activate: boolean) {
    try {
      const newEstado = activate ? 1 : 2;
      await this.httpApi.updateEmpresaTransportes(Number(id), { estado: newEstado });
      const rels: any = await this.httpApi.fetchAll('users_empresa_transportes');
      const relRows = Array.isArray(rels) ? rels : (rels?.data || []);
      const assigned = relRows.filter((r: any) => Number(r.id_empresa) === Number(id));
      for (const a of assigned) {
        const userId = Number(a.id_utilizador);
        try {
          const uRaw: any = await this.httpApi.getUser(userId);
          const user = uRaw || (uRaw?.data && uRaw.data[0]) || null;
          const userType = user && (user.profileType || user.id_tipo);
          if (userType === 'Dono Empresa Transportes' || Number(userType) === 2) {
            continue;
          }
          await this.httpApi.updateUser(userId, { estado: newEstado });
        } catch (e) {
          console.warn('Failed to update user estado', userId, e);
        }
      }

      const toast = await this.toastCtrl.create({ message: activate ? this.t.translate('company_activated') : this.t.translate('company_deactivated'), duration: 1500, color: 'success' });
      toast.present();
      this.loadCompanies();
    } catch (e) {
      console.error('Toggle company failed', e);
      const t = await this.toastCtrl.create({ message: this.t.translate('save_error'), duration: 2000, color: 'danger' });
      t.present();
    }
  }


  async viewDeliveryHistory(c: any) {
    const modal = await this.modalCtrl.create({
      component: DeliveryHistoryModalComponent,
      componentProps: {
        company: c
      },
      cssClass: 'delivery-history-fullscreen-modal',
      breakpoints: [1],
      initialBreakpoint: 1
    });
    await modal.present();
  }

}


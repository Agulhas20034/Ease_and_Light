import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase/supabase';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

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
    private supabase: SupabaseService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    public t: TranslationService
  ) {}

  ngOnInit() {
    this.loadCompanies();
  }

  ionViewWillEnter() {
    this.loadCompanies();
  }

  async loadCompanies() {
    this.loading = true;
    try {
      // Restringe as empresas: administradores vêem todas, donos vêem só as suas
      const raw = localStorage.getItem('currentUser');
      const user = raw ? JSON.parse(raw) : null;
      const role = (user && (user.profileType || user.id_tipo) ? (user.profileType || user.id_tipo).toString() : '');
      if (role === 'Administrador') {
        const data: any = await this.supabase.getAllEmpresaTransportes();
        this.companies = Array.isArray(data) ? data : (data?.data || []);
      } else if (user && user.id_utilizador) {
        // buscar linhas de relação e mapear para os registos das empresas
        const rels: any = await this.supabase.getUserEmpresas(Number(user.id_utilizador));
        const relRows = Array.isArray(rels) ? rels : (rels?.data || []);
        const ids = relRows.map((r: any) => Number(r.id_empresa)).filter((v: any) => !!v);
        const companies: any[] = [];
        for (const id of ids) {
          try {
            const c: any = await this.supabase.getEmpresaTransportes(Number(id));
            if (c) companies.push(c);
          } catch (e) {
            console.warn('Failed to load company', id, e);
          }
        }
        this.companies = companies;
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
      await this.supabase.updateEmpresaTransportes(Number(id), { estado: newEstado });
      // obter as relações e atualizar os utilizadores associados
      const rels: any = await this.supabase.fetchAll('users_empresa_transportes');
      const relRows = Array.isArray(rels) ? rels : (rels?.data || []);
      const assigned = relRows.filter((r: any) => Number(r.id_empresa) === Number(id));
      for (const a of assigned) {
        const userId = Number(a.id_utilizador);
        try {
          // obter o utilizador para saber o tipo de perfil; pular os donos (Dono Empresa Transportes / id_tipo == 2)
          const uRaw: any = await this.supabase.getUser(userId);
          const user = uRaw || (uRaw?.data && uRaw.data[0]) || null;
          const userType = user && (user.profileType || user.id_tipo);
          // se o utilizador for dono, não alterar o seu estado
          if (userType === 'Dono Empresa Transportes' || Number(userType) === 2) {
            continue;
          }
          await this.supabase.updateUser(userId, { estado: newEstado });
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

}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { ToastController, AlertController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-lista-funcionarios',
  templateUrl: './lista-funcionarios.page.html',
  styleUrls: ['./lista-funcionarios.page.scss'],
  standalone: false,
})
export class ListaFuncionariosPage implements OnInit {
  empresaId: number | null = null;
  employees: any[] = [];
  loading = false;

  constructor(
    private act: ActivatedRoute,
    private httpApi: HttpApiService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    public t: TranslationService
  ) {}

  ngOnInit() {
    this.act.queryParams.subscribe(params => {
      if (params['id']) {
        this.empresaId = Number(params['id']);
        this.loadEmployees();
      } else {
        // tentar inferir a partir das empresas do utilizador atual
        const raw = localStorage.getItem('currentUser');
        if (raw) {
          try {
            const u = JSON.parse(raw);
            if (u.id_utilizador) {
              this.loadEmployeesForUser(u.id_utilizador);
            }
          } catch (e) {}
        }
      }
    });
  }

  async loadEmployeesForUser(userId: number) {
    try {
      const rels: any = await this.httpApi.getUserEmpresas(userId);
      const rows = Array.isArray(rels) ? rels : (rels?.data || []);
      if (rows.length > 0) {
        this.empresaId = rows[0].id_empresa;
        this.loadEmployees();
      }
    } catch (e) {
      console.error('Failed to load user companies', e);
    }
  }

  async loadEmployees() {
    if (!this.empresaId) return;
    this.loading = true;
    try {
      const rels: any = await this.httpApi.fetchAll('users_empresa_transportes');
      const relRows = Array.isArray(rels) ? rels : (rels?.data || []);
      const assigned = relRows.filter((r: any) => Number(r.id_empresa) === Number(this.empresaId));

      const users: any = await this.httpApi.getAllUsers();
      const all = Array.isArray(users) ? users : (users?.data || []);

      this.employees = assigned.map((a: any) => all.find((u: any) => Number(u.id_utilizador) === Number(a.id_utilizador))).filter(Boolean);
    } catch (e) {
      console.error('Failed to load employees', e);
      const t = await this.toastCtrl.create({ message: this.t.translate('loading_failed'), duration: 2000, color: 'danger' });
      t.present();
    } finally {
      this.loading = false;
    }
  }

  add() {
    this.router.navigate(['/adiciona-funcionario'], { queryParams: { id: this.empresaId } });
  }

  edit(u: any) {
    this.router.navigate(['/edita-funcionario'], { queryParams: { id: u.id_utilizador, empresaId: this.empresaId } });
  }

  async confirmToggle(u: any) {
    const isActive = u.estado === 1;
    const header = isActive ? this.t.translate('deactivate_account') : this.t.translate('activate_account');
    const actionText = isActive ? this.t.translate('deactivate_account') : this.t.translate('activate_account');
    const alert = await this.alertCtrl.create({
      header,
      message: this.t.translate('confirm_delete'),
      buttons: [
        { text: this.t.translate('cancel'), role: 'cancel' },
        { text: actionText, handler: () => this.toggleUser(u, !isActive) }
      ]
    });
    await alert.present();
  }

  async toggleUser(u: any, activate: boolean) {
    try {
      const newEstado = activate ? 1 : 2;
      await this.httpApi.updateUser(u.id_utilizador, { estado: newEstado });
      const toast = await this.toastCtrl.create({ message: activate ? this.t.translate('account_activated') : this.t.translate('account_deactivated'), duration: 1500, color: 'success' });
      toast.present();
      this.loadEmployees();
    } catch (e) {
      console.error('Toggle failed', e);
      const t = await this.toastCtrl.create({ message: this.t.translate('toggle_error'), duration: 2000, color: 'danger' });
      t.present();
    }
  }

}

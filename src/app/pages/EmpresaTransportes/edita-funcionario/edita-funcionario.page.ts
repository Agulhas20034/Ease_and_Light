import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { ToastController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-edita-funcionario',
  templateUrl: './edita-funcionario.page.html',
  styleUrls: ['./edita-funcionario.page.scss'],
  standalone: false,
})
export class EditaFuncionarioPage implements OnInit {
  id: any = null;
  nome = '';
  email = '';
  telefone = '';
  nif = '';
  passNew = '';
  passConfirm = '';
  loading = false;
  empresaId: number | null = null;

  constructor(
    private act: ActivatedRoute,
    private httpApi: HttpApiService,
    private router: Router,
    private toastCtrl: ToastController,
    public t: TranslationService
  ) {}

  ngOnInit() {
    this.act.queryParams.subscribe(p => {
      if (p['id']) {
        this.id = Number(p['id']);
        this.loadUser();
      }
      if (p['empresaId']) {
        this.empresaId = Number(p['empresaId']);
      }
    });
  }

  async loadUser() {
    if (!this.id) return;
    try {
      const data: any = await this.httpApi.getUser(this.id);
      const u = data || (data?.data && data.data[0]) || {};
      this.nome = u.nome || '';
      this.email = u.email || '';
      this.telefone = u.telefone || '';
      this.nif = u.nif || '';
    } catch (e) {
      console.error('Failed to load user', e);
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    await toast.present();
  }

  passwordsMatch() {
    return this.passNew && this.passNew === this.passConfirm;
  }

  async save() {
    if (!this.id) return;
    this.loading = true;
    try {
      const updates: any = { nome: this.nome, telefone: this.telefone, nif: this.nif };
      try {
        await this.httpApi.updateUser(this.id, updates);
      } catch (updateErr: any) {
        console.error('Update failed', updateErr);
        this.showToast((updateErr && updateErr.message) ? updateErr.message : this.t.translate('save_error'), 'danger');
        this.loading = false;
        return;
      }

      if (this.passNew) {
        if (!this.passwordValid(this.passNew)) {
          const t = await this.toastCtrl.create({ message: this.t.translate('pw_len'), duration: 2000, color: 'warning' });
          t.present();
        } else if (!this.passwordsMatch()) {
          const t = await this.toastCtrl.create({ message: this.t.translate('passwords_not_match'), duration: 2000, color: 'warning' });
          t.present();
        } else {
          await this.httpApi.updateUserPassword(this.id, this.passNew);
        }
      }

      const t = await this.toastCtrl.create({ message: this.t.translate('edit_saved'), duration: 1500, color: 'success' });
      t.present();
      // navegar de volta para a lista de funcionários da mesma empresa, se tivermos contexto
      if (this.empresaId) {
        this.router.navigate(['/lista-funcionarios'], { queryParams: { id: this.empresaId } });
      } else {
        this.router.navigate(['/lista-funcionarios']);
      }
    } catch (e) {
      console.error('Save failed', e);
      const t = await this.toastCtrl.create({ message: this.t.translate('save_error'), duration: 2000, color: 'danger' });
      t.present();
    } finally {
      this.loading = false;
    }
  }

  passwordValid(p: string) {
    const res = { isValid: true, feedback: '' };  // Backend will validate
    return res.isValid;
  }

}

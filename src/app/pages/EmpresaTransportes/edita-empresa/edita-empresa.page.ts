import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { ToastController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-edita-empresa',
  templateUrl: './edita-empresa.page.html',
  styleUrls: ['./edita-empresa.page.scss'],
  standalone: false,
})
export class EditaEmpresaPage implements OnInit {
  id: any = null;
  name = '';
  phone = '';
  email = '';
  nif = '';
  loading = false;

  constructor(
    private act: ActivatedRoute,
    private httpApi: HttpApiService,
    private toastCtrl: ToastController,
    private router: Router,
    public t: TranslationService
  ) { }

  ngOnInit() {
    this.act.queryParams.subscribe(params => {
      if (params['id']) {
        this.id = params['id'];
        this.loadCompany();
      }
    });
  }

  async loadCompany() {
    if (!this.id) return;
    try {
      const data: any = await this.httpApi.getEmpresaTransportes(Number(this.id));
      const c = data || (data?.data && data.data[0]) || {};
      this.name = c.nome || c.name || '';
      this.phone = c.telefone || c.phone || '';
      this.email = c.email || '';
      this.nif = c.nif || '';
    } catch (e) {
      console.error('Failed to load company', e);
    }
  }

  async save() {
    if (!this.id) return;
    this.loading = true;
    try {
      // validar telefone e nif
      if (this.phone) {
        const cleaned = (this.phone || '').replace(/\D/g, '');
        if (cleaned.length < 9) {
          this.showToast(this.t.translate('phone_invalid'), 'warning');
          this.loading = false;
          return;
        }
      }
      if (this.nif) {
        const cleanedNif = (this.nif || '').replace(/\D/g, '');
        if (cleanedNif.length !== 9) {
          this.showToast(this.t.translate('nif_invalid'), 'warning');
          this.loading = false;
          return;
        }
      }

      const updates: any = {};
      if (this.name) updates.nome = this.name;
      if (this.phone) updates.telefone = this.phone;
      if (this.email) updates.email = this.email;
      if (this.nif) updates.nif = this.nif;
      await this.httpApi.updateEmpresaTransportes(Number(this.id), updates);
      const t = await this.toastCtrl.create({ message: this.t.translate('company_updated'), duration: 1500, color: 'success' });
      t.present();
      this.router.navigate(['/gere-empresas']);
    } catch (e) {
      console.error('Save failed', e);
      const t = await this.toastCtrl.create({ message: this.t.translate('save_error'), duration: 2000, color: 'danger' });
      t.present();
    } finally {
      this.loading = false;
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    toast.present();
  }

}

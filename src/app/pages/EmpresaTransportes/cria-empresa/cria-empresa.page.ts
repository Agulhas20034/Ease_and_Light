import { Component, OnInit } from '@angular/core';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-cria-empresa',
  templateUrl: './cria-empresa.page.html',
  styleUrls: ['./cria-empresa.page.scss'],
  standalone: false,
})
export class CriaEmpresaPage implements OnInit {
  nome = '';
  telefone = '';
  email = '';
  nif = '';
  loading = false;

  constructor(
    private httpApi: HttpApiService,
    private router: Router,
    private toastCtrl: ToastController,
    public t: TranslationService
  ) { }

  ngOnInit() {
  }

  async createCompany() {
    this.loading = true;
    try {
      // validar formatos de telefone e nif
      if (this.telefone) {
        const cleaned = (this.telefone || '').replace(/\D/g, '');
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

      const rec: any = { nome: this.nome, estado: 1 };
      if (this.telefone) rec.telefone = this.telefone;
      if (this.email) rec.email = this.email;
      if (this.nif) rec.nif = this.nif;
      const resp: any = await this.httpApi.createEmpresaTransportes(rec);
      console.debug('createEmpresaTransportes response', resp);
      let inserted = Array.isArray(resp) ? resp[0] : (resp?.data ? resp.data[0] : resp);
      let newId = inserted?.id_empresa ?? inserted?.id;

      if (!newId && this.nif) {
        try {
          const nifClean = String(this.nif).replace(/\D/g, '').trim();
          const empresas = await this.httpApi.getAllEmpresaTransportes();
          const found = empresas.find((e: any) => String(e.nif) === nifClean);
          if (found) {
            console.debug('createEmpresaTransportes found by nif', found);
            newId = found.id_empresa ?? found.id;
          }
        } catch (e) {
          console.warn('createEmpresaTransportes lookup by nif failed', e);
        }
      }

      if (!newId) {
        try {
          const all: any = await this.httpApi.getAllEmpresaTransportes();
          const rows = Array.isArray(all) ? all : (all?.data || []);
          const found = rows.find((r: any) => {
            if (this.nif && r.nif && String(r.nif) === String(this.nif)) return true;
            if (this.telefone && r.telefone && String(r.telefone) === String(this.telefone)) return true;
            if (this.nome && r.nome && String(r.nome) === String(this.nome)) return true;
            return false;
          });
          if (found) {
            console.debug('createEmpresaTransportes fallback found', found);
            newId = found.id_empresa ?? found.id;
          } else {
            console.warn('createEmpresaTransportes: could not determine new company id', { resp, nome: this.nome, telefone: this.telefone, nif: this.nif });
          }
        } catch (e) {
          console.warn('createEmpresaTransportes fallback lookup failed', e);
        }
      }

      try {
        const raw = localStorage.getItem('currentUser');
        const user = raw ? JSON.parse(raw) : null;
        if (user && user.id_utilizador && newId) {
          const linkResp: any = await this.httpApi.addUserEmpresa(Number(user.id_utilizador), Number(newId));
          console.debug('addUserEmpresa response', linkResp);
        } else if (user && user.id_utilizador && !newId) {
          console.warn('addUserEmpresa skipped: newId missing', { user });
        }
      } catch (linkErr) {
        console.warn('Failed to link user to empresa', linkErr);
      }

      const t = await this.toastCtrl.create({ message: this.t.translate('company_created'), duration: 1500, color: 'success' });
      t.present();
      this.router.navigate(['/gere-empresas']);
    } catch (e) {
      console.error('Create company failed', e);
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

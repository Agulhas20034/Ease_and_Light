import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase/supabase';
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
  nif = '';
  loading = false;

  constructor(
    private supabase: SupabaseService,
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
      if (this.nif) rec.nif = this.nif;
      await this.supabase.createEmpresaTransportes(rec);
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

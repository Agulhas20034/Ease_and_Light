import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase/supabase';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-cria-localizacao',
  templateUrl: './cria-localizacao.page.html',
  styleUrls: ['./cria-localizacao.page.scss'],
  standalone: false,
})
export class CriaLocalizacaoPage implements OnInit {
  // Campos do formulário
  tipo: any = null;
  hora_abertura = '';
  hora_fecho = '';
  email = '';
  telefone = '';
  link = '';
  nome = '';
  lat: any = null;
  lon: any = null;
  cod_postal = '';
  nif = '';
  estado = 1; // por defeito 1
  tipos: any[] = [];
  loading = false;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private toastCtrl: ToastController,
    public t: TranslationService
  ) { }

  ngOnInit() {
    this.loadTipos();
  }

  // carregar tipos de estabelecimento para o select
  async loadTipos() {
    try {
      const r: any = await this.supabase.getAllTipoEstabelecimento();
      this.tipos = Array.isArray(r) ? r : (r?.data || []);
    } catch (e) {
      console.warn('Failed to load tipos', e);
    }
  }

  // Validações e criação da localizacao
  async createLocation() {
    this.loading = true;
    try {
      // validar NIF: exatamente 9 dígitos
      if (this.nif) {
        const nifClean = (this.nif || '').replace(/\D/g, '');
        if (nifClean.length !== 9) {
          this.showToast(this.t.translate('nif_invalid'), 'warning');
          this.loading = false;
          return;
        }
        const taken = await this.supabase.isLocalizacaoNifTaken(nifClean);
        if (taken) {
          this.showToast(this.t.translate('nif_taken'), 'warning');
          this.loading = false;
          return;
        }
      }

      // validar cod_postal formato ###-####
      if (this.cod_postal) {
        if (!/^\d{4}-\d{3}$/.test(this.cod_postal)) {
          this.showToast(this.t.translate('postal_invalid'), 'warning');
          this.loading = false;
          return;
        }
      }

      const rec: any = {
        tipo: this.tipo,
        hora_abertura: this.hora_abertura,
        hora_fecho: this.hora_fecho,
        email: this.email,
        telefone: this.telefone,
        link: this.link,
        nome: this.nome,
        lat: this.lat,
        lon: this.lon,
        cod_postal: this.cod_postal,
        nif: this.nif ? (this.nif || '') : null,
        estado: this.estado
      };

      await this.supabase.createLocalizacao(rec);
      const toast = await this.toastCtrl.create({ message: this.t.translate('location_created'), duration: 1500, color: 'success' });
      toast.present();
      this.router.navigate(['/lista-localizacoes']);
    } catch (e) {
      console.error('Create location failed', e);
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

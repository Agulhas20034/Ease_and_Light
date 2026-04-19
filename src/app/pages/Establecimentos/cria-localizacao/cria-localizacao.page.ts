import { Component, OnInit } from '@angular/core';
import { HttpApiService } from '../../../services/http-api/http-api.service';
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
    private httpApi: HttpApiService,
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
      const r: any = await this.httpApi.getAllTipoEstabelecimento();
      this.tipos = Array.isArray(r) ? r : (r?.data || []);
    } catch (e) {
      console.warn('Failed to load tipos', e);
    }
  }

  // Criação da localizacao - backend handles all validation
  async createLocation() {
    this.loading = true;
    try {
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

      const resp: any = await this.httpApi.createEstabelecimento(rec);
      console.debug('createEstabelecimento response', resp);

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

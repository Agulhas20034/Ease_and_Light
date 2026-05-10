import { Component, OnInit } from '@angular/core';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-edita-localizacao',
  templateUrl: './edita-localizacao.page.html',
  styleUrls: ['./edita-localizacao.page.scss'],
  standalone: false,
})
export class EditaLocalizacaoPage implements OnInit {
  id: any = null;
  locId: any = null;
  tipo: any = null;
  hora_abertura = '';
  hora_fecho = '';
  email = '';
  telefone = '';
  link = '';
  nome = '';
  originalNif = '';
  lat: any = null;
  lon: any = null;
  cod_postal = '';
  nif = '';
  estado = 1;
  tipos: any[] = [];
  loading = false;

  constructor(
    private httpApi: HttpApiService,
    private route: ActivatedRoute,
    private router: Router,
    private toastCtrl: ToastController,
    public t: TranslationService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.queryParamMap.get('id');
    this.loadTipos();
    if (this.id) this.loadLocalizacao();
  }

  async loadTipos() {
    try {
      const r: any = await this.httpApi.getAllTipoEstabelecimento();
      this.tipos = Array.isArray(r) ? r : (r?.data || []);
    } catch (e) {
      console.warn('Failed to load tipos', e);
    }
  }

  async loadLocalizacao() {
    try {
      // Carregar pela relação id_estabelecimento — pode devolver várias localizações, usamos a primeira
      const list: any = await this.httpApi.getLocalizacoesByEstabelecimento(Number(this.id));
      const rows = Array.isArray(list) ? list : (list?.data || []);
      const rec = rows && rows.length > 0 ? rows[0] : null;
      if (!rec) return;
      this.locId = rec.id_localizacao || null;
      this.tipo = rec.tipo;
      this.hora_abertura = rec.hora_abertura || '';
      this.hora_fecho = rec.hora_fecho || '';
      this.email = rec.email || '';
      this.telefone = rec.telefone || '';
      this.link = rec.link || '';
      this.nome = rec.nome || rec.nome_rua || '';
      this.originalNif = rec.nif || '';
      this.lat = rec.lat || null;
      this.lon = rec.lon || null;
      this.cod_postal = rec.cod_postal || '';
      this.nif = rec.nif || '';
      this.estado = rec.estado || 1;
    } catch (e) {
      console.error('Failed to load localizacao', e);
    }
  }

  async save() {
    this.loading = true;
    try {
      if (this.nif) {
        const nifClean = (this.nif || '').replace(/\D/g, '');
        if (nifClean.length !== 9) {
          this.showToast(this.t.translate('nif_invalid'), 'warning');
          this.loading = false;
          return;
        }
        const originalClean = (this.originalNif || '').replace(/\D/g, '');
        // Se o NIF não mudou em relação ao original, não validar unicidade
        if (nifClean !== originalClean) {
          const locIdNum = this.locId ? Number(this.locId) : NaN;
          const taken = this.locId ? await this.httpApi.isLocalizacaoNifTakenByOther(nifClean, locIdNum) : await this.httpApi.isLocalizacaoNifTaken(nifClean);
          if (taken) {
            this.showToast(this.t.translate('nif_taken'), 'warning');
            this.loading = false;
            return;
          }
        }
      }

      if (this.cod_postal) {
        if (!/^\d{4}-\d{3}$/.test(this.cod_postal)) {
          this.showToast(this.t.translate('postal_invalid'), 'warning');
          this.loading = false;
          return;
        }
      }

      const updates: any = {
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
        nif: this.nif,
        estado: this.estado
      };

      const estabId = Number(this.id);
      if (!isNaN(estabId)) {
        await this.httpApi.updateLocalizacaoByEstabelecimento(estabId, updates);
      } else if (this.locId) {
        await this.httpApi.updateLocalizacao(Number(this.locId), updates);
      } else {
        throw new Error('Invalid id for update');
      }
      const toast = await this.toastCtrl.create({ message: this.t.translate('edit_saved'), duration: 1500, color: 'success' });
      toast.present();
      this.router.navigate(['/lista-localizacoes']);
    } catch (e) {
      console.error('Save localizacao failed', e);
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

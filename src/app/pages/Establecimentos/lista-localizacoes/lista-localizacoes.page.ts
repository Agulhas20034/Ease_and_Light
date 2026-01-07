import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase/supabase';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-lista-localizacoes',
  templateUrl: './lista-localizacoes.page.html',
  styleUrls: ['./lista-localizacoes.page.scss'],
  standalone: false,
})
export class ListaLocalizacoesPage implements OnInit {
  locais: any[] = [];
  loading = false;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    public t: TranslationService
  ) {}

  ngOnInit() {
    this.loadLocations();
  }

  ionViewWillEnter() {
    this.loadLocations();
  }

  /**
   * Carregar localizações: administradores veem todas, donos veem só as suas
   */
  async loadLocations() {
    this.loading = true;
    try {
      const raw = localStorage.getItem('currentUser');
      const user = raw ? JSON.parse(raw) : null;

      const role = (user && (user.profileType || user.id_tipo) ? (user.profileType || user.id_tipo).toString() : '');

      if (role === 'Administrador') {
        const data: any = await this.supabase.getAllLocalizacoes();
        const rows = Array.isArray(data) ? data : (data?.data || []);
        this.locais = rows.map((r: any) => ({ ...(r||{}), estado: Number(r.estado), _expanded: false }));
      } else if (user && user.id_utilizador) {
        // obter os estabelecimentos associados ao utilizador e buscar localizacoes
        const rels: any = await this.supabase.getUserEstabelecimentos(Number(user.id_utilizador));
        const relRows = Array.isArray(rels) ? rels : (rels?.data || []);

        const estabIds = relRows.map((r: any) => Number(r.id_estabelecimento)).filter((v: any) => !!v);

        const result: any[] = [];
        for (const id of estabIds) {
          try {
            const locs: any = await this.supabase.getLocalizacoesByEstabelecimento(Number(id));
            const list = Array.isArray(locs) ? locs : (locs?.data || []);
            for (const l of list) result.push(l);
          } catch (e) {
            console.warn('Failed to load locations for estabelecimento', id, e);
          }
        }

        this.locais = result.map((r: any) => ({ ...(r||{}), estado: Number(r.estado), _expanded: false }));
      } else {
        this.locais = [];
      }
    } catch (e) {
      console.error('Failed to load locations', e);
      const t = await this.toastCtrl.create({ message: this.t.translate('loading_failed'), duration: 2000, color: 'danger' });
      t.present();
    } finally {
      this.loading = false;
    }
  }

  create() { this.router.navigate(['/cria-localizacao']); }

  // Usar id_estabelecimento como identificador principal para ações
  edit(l: any) {
    const estabId = l.id_estabelecimento ?? l.id_estab ?? l.id;
    this.router.navigate(['/edita-localizacao'], { queryParams: { id: estabId } });
  }

  manageEmployees(l: any) {
    const estabId = l.id_estabelecimento ?? l.id_estab ?? l.id;
    this.router.navigate(['/lista-empregados'], { queryParams: { id: estabId } });
  }

  toggleExpand(l: any) { l._expanded = !l._expanded; }

  async confirmToggleLocation(l: any) {
    const id = l.id_estabelecimento ?? l.id_estabelecimento ?? l.id_estab ?? l.id_localizacao ?? l.id;
    const isActive = l.estado === 1;
    const header = isActive ? this.t.translate('deactivate') : this.t.translate('activate_account');
    const actionText = isActive ? this.t.translate('deactivate') : this.t.translate('activate_account');
    const alert = await this.alertCtrl.create({
      header,
      message: this.t.translate('confirm_delete'),
      buttons: [
        { text: this.t.translate('cancel'), role: 'cancel' },
        { text: actionText, handler: () => this.toggleLocation(id, !isActive, false) }
      ]
    });
    await alert.present();
  }

  async confirmPermanentClose(l: any) {
    const id = l.id_estabelecimento ?? l.id_estabelecimento ?? l.id_estab ?? l.id_localizacao ?? l.id;
    const alert = await this.alertCtrl.create({
      header: this.t.translate('deactivate'),
      message: this.t.translate('confirm_delete'),
      buttons: [
        { text: this.t.translate('cancel'), role: 'cancel' },
        { text: this.t.translate('deactivate'), handler: () => this.toggleLocation(id, false, true) }
      ]
    });
    await alert.present();
  }

  async toggleLocation(id: any, activate: boolean, permanent: boolean) {
    try {
      const newEstado = permanent ? 3 : (activate ? 1 : 2);
      const estabId = Number(id);
      if (isNaN(estabId)) {
        const t = await this.toastCtrl.create({ message: this.t.translate('toggle_error'), duration: 2000, color: 'danger' });
        t.present();
        return;
      }
      await this.supabase.updateLocalizacaoByEstabelecimento(estabId, { estado: newEstado });
      const toast = await this.toastCtrl.create({ message: activate ? this.t.translate('location_activated') : this.t.translate('location_deactivated'), duration: 1500, color: 'success' });
      toast.present();
      this.loadLocations();
    } catch (e) {
      console.error('Toggle location failed', e);
      const t = await this.toastCtrl.create({ message: this.t.translate('toggle_error'), duration: 2000, color: 'danger' });
      t.present();
    }
  }

}

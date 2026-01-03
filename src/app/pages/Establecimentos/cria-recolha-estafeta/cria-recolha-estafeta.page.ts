import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase/supabase';
import { TranslationService } from '../../../services/translations/translation.service';
import { ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cria-recolha-estafeta',
  templateUrl: './cria-recolha-estafeta.page.html',
  styleUrls: ['./cria-recolha-estafeta.page.scss'],
  standalone: false,
})
export class CriaRecolhaEstafetaPage implements OnInit {
  public entregas: any[] = [];
  public loading = false;

  constructor(
    private supabase: SupabaseService,
    public t: TranslationService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadEntregas();
  }

  tKey(k: string) { return this.t.translate(k); }

  // Carrega entregas com estado 3 (em transporte) e filtra por papel/estabelecimento
  async loadEntregas() {
    this.loading = true;
    try {
      const raw = localStorage.getItem('currentUser');
      const user = raw ? JSON.parse(raw) : null;
      const role = user && (user.profileType || user.id_tipo) ? (user.profileType || user.id_tipo).toString() : '';

      const all: any = await this.supabase.getAllEntregasRecolhas();
      const rows = Array.isArray(all) ? all : (all?.data || []);

      const filtered = (rows || []).filter((r: any) => {
        const estado = r.id_estado_entrega_recolha ?? r.estado ?? r.status;
        return Number(estado) === 3;
      });

      if (role === 'Administrador') {
        this.entregas = filtered;
      } else if (user && user.id_utilizador) {
        const rels: any = await this.supabase.getUserEstabelecimentos(Number(user.id_utilizador));
        const relRows = Array.isArray(rels) ? rels : (rels?.data || []);
        const estabIds = relRows.map((r: any) => Number(r.id_estabelecimento)).filter((v: any) => !!v);
        this.entregas = filtered.filter((r: any) => {
          const rid = r.id_estabelecimento_e;
          return estabIds.includes(Number(rid));
        });
      } else {
        this.entregas = [];
      }

    } catch (e) {
      console.error('Erro ao carregar entregas', e);
      this.showToast(this.tKey('load_error') || 'Erro ao carregar', 'danger');
    } finally {
      this.loading = false;
    }
  }

  private async showToast(message: string, color = 'primary') {
    const t = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    await t.present();
  }

  // Ao clicar no botão converte entrega para recolha (tipo=1, estado=6)
  async convertToRecolha(entrega: any) {
    const id = entrega.id_entrega_recolha;
    const confirm = await this.alertCtrl.create({
      header: this.tKey('confirm_action') || 'Confirmar',
      message: this.tKey('confirm_convert_to_pickup') || 'Deseja marcar esta entrega como recolha?',
      buttons: [
        { text: this.tKey('cancel') || 'Cancelar', role: 'cancel' },
        { text: this.tKey('yes') || 'Sim', handler: async () => {
          try {
            const updates: any = { tipo: 1, estado: 6};
            await this.supabase.updateEntregaRecolha(Number(id), updates);
            this.showToast(this.tKey('update_success') || 'Atualizado', 'success');
            this.entregas = (this.entregas || []).filter((e: any) => {
              const eid = e.id_entrega_recolha || e.id || e.id_entrega || e.id_recolha;
              return Number(eid) !== Number(id);
            });
            await this.loadEntregas();
            this.router.navigateByUrl('/folder/inbox');
          } catch (e) {
            console.error('Falha ao atualizar entrega', e);
            this.showToast(this.tKey('save_error') || 'Erro ao atualizar', 'danger');
          }
        }}
      ]
    });
    await confirm.present();
  }

}

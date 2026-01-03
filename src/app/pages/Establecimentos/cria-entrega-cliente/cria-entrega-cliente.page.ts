import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase/supabase';
import { TranslationService } from '../../../services/translations/translation.service';
import { ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cria-entrega-cliente',
  templateUrl: './cria-entrega-cliente.page.html',
  styleUrls: ['./cria-entrega-cliente.page.scss'],
  standalone: false,
})
export class CriaEntregaClientePage implements OnInit {
  public entregas: any[] = [];
  public loading = false;
  public debugInfo: { fetched: number; filtered: number } = { fetched: 0, filtered: 0 };

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

  // Lista items com tipo=1 e estado=6 e aplica filtro por estabelecimento/role
  async loadEntregas() {
    this.loading = true;
    try {
      const raw = localStorage.getItem('currentUser');
      const user = raw ? JSON.parse(raw) : null;
      const role = user && (user.profileType || user.id_tipo) ? (user.profileType || user.id_tipo).toString() : '';

      const all: any = await this.supabase.getAllEntregasRecolhas();
      const rows = Array.isArray(all) ? all : (all?.data || []);
      console.debug('cria-entrega-cliente: fetched rows', Array.isArray(rows) ? rows.length : 0, rows);

      // Filtrar por tipo = 1 e estado = 6
      let filtered = (rows || []).filter((r: any) => {
        const tipo = r.id_tipo_entrega_recolha ?? r.tipo ?? r.tipo_entrega;
        const estado = r.id_estado_entrega_recolha ?? r.estado ?? r.status;
        return Number(tipo) === 1 && Number(estado) === 6;
      });
      this.debugInfo.fetched = Array.isArray(rows) ? rows.length : 0;
      this.debugInfo.filtered = Array.isArray(filtered) ? filtered.length : 0;
      console.debug('cria-entrega-cliente: filtered count', this.debugInfo.filtered);

      if (role === 'Administrador') {
        this.entregas = filtered;
      } else if (user && user.id_utilizador) {
        const rels: any = await this.supabase.getUserEstabelecimentos(Number(user.id_utilizador));
        const relRows = Array.isArray(rels) ? rels : (rels?.data || []);
        const estabIds = relRows.map((r: any) => Number(r.id_estabelecimento)).filter((v: any) => !!v);
        this.entregas = filtered.filter((r: any) => {
          const rid = (r.id_estabelecimento_e ?? r.id_estabelecimento_entrega ?? r.id_estabelecimento) || r.id_estab_e;
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

  // Converte item para entrega cliente: define tipo=2 e estado=4
  async convertToEntrega(entrega: any) {
    const id = entrega.id_entrega_recolha;
    const confirm = await this.alertCtrl.create({
      header: this.tKey('confirm_action') || 'Confirmar',
      message: this.tKey('confirm_start_delivery_cliente') || 'Passar para entrega de cliente?',
      buttons: [
        { text: this.tKey('cancel') || 'Cancelar', role: 'cancel' },
        { text: this.tKey('yes') || 'Sim', handler: async () => {
                try {
                  const now = new Date().toISOString();
                  const updates: any = { tipo: 2, estado: 4, data_hora_entrega: now };
                  await this.supabase.updateEntregaRecolha(Number(id), updates);
                  this.showToast(this.tKey('update_success') || 'Atualizado', 'success');
                  // remove localmente pra manter a lista atualizada
                  this.entregas = (this.entregas || []).filter((e: any) => {
                    const eid = e.id_entrega_recolha;
                    return Number(eid) !== Number(id);
                  });
                  // recarrega dados do backend
                  await this.loadEntregas();
                  // redirect to inbox
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


import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase/supabase';
import { TranslationService } from '../../../services/translations/translation.service';
import { ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cria-entrega-estafeta',
  templateUrl: './cria-entrega-estafeta.page.html',
  styleUrls: ['./cria-entrega-estafeta.page.scss'],
  standalone: false,
})
export class CriaEntregaEstafetaPage implements OnInit {
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

  // Carrega entregas/recolhas filtradas por tipo e estado e por estabelecimentos do utilizador
  async loadEntregas(event?: any) {
    this.loading = true;
    try {
      const raw = localStorage.getItem('currentUser');
      const user = raw ? JSON.parse(raw) : null;
      const role = user && (user.profileType || user.id_tipo) ? (user.profileType || user.id_tipo).toString() : '';

      const all: any = await this.supabase.getAllEntregasRecolhas();
      const rows = Array.isArray(all) ? all : (all?.data || []);

      // Filtrar por tipo = recolha (1) e estado 1 ou 2
      let filtered = (rows || []).filter((r: any) => {
        const tipo = r.id_tipo_entrega_recolha ?? r.tipo ?? r.tipo_entrega;
        const estado = r.id_estado_entrega_recolha ?? r.estado ?? r.status;
        // Garantir que existe veículo e estafeta associados
        const hasVeiculo = r.id_veiculo ?? r.id_veiculo_entrega ?? r.id_veiculo_e ?? r.veiculo_id ?? null;
        const hasEstafeta = r.id_estafeta ?? r.id_entregador ?? r.id_estafeta_e ?? r.id_estafeta_entrega ?? null;
        const hasBoth = (hasVeiculo !== null && hasVeiculo !== undefined) && (hasEstafeta !== null && hasEstafeta !== undefined);
        return Number(tipo) === 1 && (Number(estado) === 1 || Number(estado) === 2) && hasBoth;
      });

      if (role === 'Administrador') {
        this.entregas = filtered;
      } else if (user && user.id_utilizador) {
        const rels: any = await this.supabase.getUserEstabelecimentos(Number(user.id_utilizador));
        const relRows = Array.isArray(rels) ? rels : (rels?.data || []);
        const estabIds = relRows.map((r: any) => Number(r.id_estabelecimento)).filter((v: any) => !!v);
        this.entregas = filtered.filter((r: any) => {
          const rid = r.id_estabelecimento_r ?? r.id_estabelecimento ?? r.id_estabelecimento_recolha ?? r.id_estab_r;
          return estabIds.includes(Number(rid));
        });
      } else {
        this.entregas = [];
      }

    } catch (e) {
      console.error('Erro ao carregar entregas/recolhas', e);
      this.showToast(this.tKey('load_error') || 'Erro ao carregar', 'danger');
    } finally {
      this.loading = false;
      if (event) event.target.complete();
    }
  }

  private async showToast(message: string, color = 'primary') {
    const t = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    await t.present();
  }

  // Inicia a transformação de recolha para entrega: define tipo=2 e estado=3
  async startEntrega(entrega: any) {
    const id = entrega.id_entrega_recolha || entrega.id || entrega.id_entrega || entrega.id_recolha;
    const confirm = await this.alertCtrl.create({
      header: this.tKey('confirm_action') || 'Confirmar',
      message: this.tKey('confirm_start_delivery') || 'Passar para entrega e marcar como em transporte?',
      buttons: [
        { text: this.tKey('cancel') || 'Cancelar', role: 'cancel' },
        { text: this.tKey('yes') || 'Sim', handler: async () => {
          try {
            const updates: any = { tipo: 2, estado: 3 };
            await this.supabase.updateEntregaRecolha(Number(id), updates);
            this.showToast(this.tKey('update_success') || 'Atualizado', 'success');
            this.entregas = (this.entregas || []).filter((e: any) => {
              const eid = e.id_entrega_recolha || e.id || e.id_entrega || e.id_recolha;
              return Number(eid) !== Number(id);
            });
            await this.loadEntregas();
            // Após atualizar, redirecionar para o mapa inbox
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

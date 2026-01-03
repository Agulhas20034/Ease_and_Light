import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase/supabase';
import { TranslationService } from '../../../services/translations/translation.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cria-recolha-cliente',
  templateUrl: './cria-recolha-cliente.page.html',
  styleUrls: ['./cria-recolha-cliente.page.scss'],
  standalone: false,
})
export class CriaRecolhaClientePage implements OnInit {
  // Dados carregados
  public clients: any[] = []; // peregrinos
  public mochilas: any[] = [];
  public empresas: any[] = [];
  public estabelecimentos: any[] = [];
  public selectedEstabelecimento: any = null;

  // Seleções do formulário
  public selectedClient: any = null;
  public selectedMochila: any = null;
  public selectedEmpresa: any = null;
  public dateTimeRecolha = new Date().toISOString();
  // Entrega: lista de estabelecimentos para entrega (exclui recolha)
  public deliveryEstabelecimentos: any[] = [];
  public selectedDeliveryEstabelecimento: any = null;

  public loading = false;

  constructor(
    private supabase: SupabaseService,
    public t: TranslationService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadClients();
    this.loadEmpresas();
    this.loadEstabelecimentos();
  }

  // Traduz uma key
  tKey(k: string) { return this.t.translate(k); }

  // Carrega utilizadores do tipo Peregrino (id_tipo = 5)
  async loadClients() {
    try {
      const peregrinoTipo = 5;
      const byTipo = await this.supabase.getUsersByTipo(peregrinoTipo);
      this.clients = (byTipo || []) as any[];
    } catch (e) {
      console.error('Erro ao carregar clientes', e);
    }
  }

  // Ao escolher cliente, carregar mochilas pertencentes a esse cliente
  async onClientChange() {
    this.mochilas = [];
    this.selectedMochila = null;
    if (!this.selectedClient) return;
    try {
      const all = await this.supabase.getAllMochilas();
      const uid = String(this.selectedClient.id_utilizador || this.selectedClient.id_user || '');
      // mochilas pertencentes ao utilizador
      let userMochilas = (all || []).filter((m: any) => String(m.id_user ?? m.id_utilizador ?? '') === uid);

      // remover mochilas que já estejam em entregas_recolhas com estado != 4
      try {
        const ents: any = await this.supabase.getAllEntregasRecolhas();
        const entRows = Array.isArray(ents) ? ents : (ents?.data || []);
        const taken = new Set<string>();
        for (const er of (entRows || [])) {
          const estado = er.id_estado_entrega_recolha ?? er.estado ?? er.status;
          if (Number(estado) !== 4) {
            const mid = er.id_mochila ?? er.id_mochila_fk ?? er.id_mochila_id;
            if (mid !== undefined && mid !== null) taken.add(String(mid));
          }
        }
        userMochilas = userMochilas.filter((m: any) => !taken.has(String(m.id_mochila ?? m.id ?? '')));
      } catch (e) {
        console.warn('Não foi possível carregar entregas_recolhas para filtrar mochilas', e);
      }

      this.mochilas = userMochilas;
    } catch (e) {
      console.error('Erro ao carregar mochilas do cliente', e);
    }
  }

  // Carrega estabelecimentos conforme o tipo de utilizador
  async loadEstabelecimentos() {
    try {
      const raw = localStorage.getItem('currentUser');
      const user = raw ? JSON.parse(raw) : null;
      const role = (user && (user.profileType) ? (user.profileType).toString() : '');

      if (role === 'Administrador') {
        const data: any = await this.supabase.getAllLocalizacoes();
        const rows = Array.isArray(data) ? data : (data?.data || []);
        this.estabelecimentos = rows || [];
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
        this.estabelecimentos = result || [];
        // Se for empregado e tiver uma só localização, preenche automaticamente
        if ((this.estabelecimentos || []).length === 1) {
          this.selectedEstabelecimento = this.estabelecimentos[0];
        }
      } else {
        this.estabelecimentos = [];
      }
      // Atualizar lista de entregas com base no estabelecimento selecionado (se houver)
      await this.updateDeliveryEstabelecimentos();
    } catch (e) {
      console.error('Failed to load estabelecimentos', e);
    }
  }

  // Carregar empresas de transporte para o dropdown
  async loadEmpresas() {
    try {
      const all = await this.supabase.getAllEmpresaTransportes();
      this.empresas = (all || []) as any[];
    } catch (e) {
      console.error('Erro ao carregar empresas', e);
    }
  }

  // Preenche a localização de recolha com a localização atual do dispositivo

  private async showToast(message: string, color = 'primary') {
    const t = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    await t.present();
  }

  // Validação simples do formulário
  valid(): boolean {
    if (!this.selectedClient) return false;
    if (!this.selectedMochila) return false;
    if (!this.selectedEstabelecimento) return false;
    if (!this.selectedDeliveryEstabelecimento) return false;
    return true;
  }

  // Submete a recolha ao backend (cria um registo em entregas_recolhas)
  async createRecolha() {
    if (!this.valid()) {
      this.showToast(this.tKey('provide_all_fields') || 'Preencha todos os campos', 'warning');
      return;
    }
    this.loading = true;
    try {
      // definir timestamp no momento da submissão
      const now = new Date().toISOString();
      // Possíveis nomes de colunas para recolha/entrega (variam conforme db schema)
      const pickupId = this.selectedEstabelecimento ? (this.selectedEstabelecimento.id_estabelecimento || this.selectedEstabelecimento.id) : null;
      const deliveryId = this.selectedDeliveryEstabelecimento ? (this.selectedDeliveryEstabelecimento.id_estabelecimento || this.selectedDeliveryEstabelecimento.id) : null;
      
      // Construir Objeto Base
      const base: any = {
        id_mochila: this.selectedMochila.id_mochila || this.selectedMochila.id || null,
        id_empresa: this.selectedEmpresa ? (this.selectedEmpresa.id_empresa || this.selectedEmpresa.id) : null,
        data_hora_recolha: now,
        id_estabelecimento_r: pickupId,
        id_estabelecimento_e: deliveryId,
        tipo: 1, // tipo = Recolha
        estado: 1 // estado = Pendente
      };

      console.log('Creating collection with payload base', base, 'pickupId', pickupId, 'deliveryId', deliveryId);

      let lastErr: any = null;
      let created = false;
        try {
          await this.supabase.createEntregaRecolha(base);
          created = true;
          
        } catch (err: any) {
          lastErr = err;
          // Se for erro de coluna desconhecida, tentamos o próximo candidato
          if (err?.code === 'PGRST204' && String(err?.message || '').includes('Could not find')) {
            
          }
          // erro diferente -> não faz sentido tentar mais
        }
      
      if (!created) throw lastErr || new Error('Falha ao criar recolha');
      this.showToast(this.tKey('create_collection_client') || 'Recolha criada', 'success');
      // remove mochila selecionada da lista local e recarregar mochilas do cliente
      try {
        const mid = String(this.selectedMochila?.id_mochila ?? this.selectedMochila?.id ?? '');
        this.mochilas = (this.mochilas || []).filter((m: any) => String(m.id_mochila ?? m.id ?? '') !== mid);
        this.selectedMochila = null;
        await this.onClientChange();
      } catch (e) {
        // ignore
      }
      this.router.navigateByUrl('/folder/inbox');
    } catch (e: any) {
      console.error('Erro ao criar recolha', e);
      this.showToast(e?.message || this.tKey('save_error'), 'danger');
    } finally {
      this.loading = false;
    }
  }

  // Atualiza lista de estabelecimentos de entrega (todas exceto a de recolha selecionada)
  async updateDeliveryEstabelecimentos() {
    try {
      const all: any = await this.supabase.getAllLocalizacoes();
      const rows = Array.isArray(all) ? all : (all?.data || []);
      const excludeId = this.selectedEstabelecimento ? (this.selectedEstabelecimento.id_estabelecimento || this.selectedEstabelecimento.id) : null;
      this.deliveryEstabelecimentos = (rows || []).filter((r: any) => {
        const rid = r.id_estabelecimento ?? r.id ?? r.id_estab;
        return rid !== excludeId;
      });
      if (this.selectedDeliveryEstabelecimento) {
        const sid = this.selectedDeliveryEstabelecimento.id_estabelecimento ?? this.selectedDeliveryEstabelecimento.id ?? this.selectedDeliveryEstabelecimento.id_estab;
        if (!this.deliveryEstabelecimentos.find((d: any) => (d.id_estabelecimento ?? d.id ?? d.id_estab) === sid)) this.selectedDeliveryEstabelecimento = null;
      }
    } catch (e) {
      console.error('Failed to load delivery establishments', e);
    }
  }

  // Quando muda o estabelecimento de recolha, atualiza as opções de entrega
  async onEstabelecimentoChange() {
    await this.updateDeliveryEstabelecimentos();
  }

}

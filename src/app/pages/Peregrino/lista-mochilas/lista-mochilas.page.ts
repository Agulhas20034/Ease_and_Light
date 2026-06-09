import { Component, OnInit } from '@angular/core';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-lista-mochilas',
  templateUrl: './lista-mochilas.page.html',
  styleUrls: ['./lista-mochilas.page.scss'],
  standalone: false,
})
export class ListaMochilasPage implements OnInit {
  public mochilas: any[] = [];
  public loading = false;

  constructor(private httpApi: HttpApiService, public t: TranslationService) { }

  async ngOnInit() {
    await this.loadMochilas();
  }

  // Refresh ao carregar a página
  async ionViewWillEnter() {
    await this.loadMochilas();
  }

  get currentUser() {
    try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch { return null; }
  }

  async loadMochilas() {
    this.loading = true;
    try {
      const all = await this.httpApi.getAllMochilas();
      const user = this.currentUser;

      // Carregar users para mapear donos
      let users: any[] = [];
      try {
        const response = await this.httpApi.getAllUsers();
        users = Array.isArray(response) ? response : (response?.data || []);
      } catch (uErr) {
        console.warn('Could not load users for owner mapping', uErr);
      }
      const usersById: Record<string, string> = {};
      for (const u of users) {
        if (u && (u.id_utilizador !== undefined && u.id_utilizador !== null)) {
          usersById[String(u.id_utilizador)] = u.email || u.nome || '';
        }
        if (u && (u.id_user !== undefined && u.id_user !== null)) {
          usersById[String(u.id_user)] = u.email || u.nome || '';
        }
      }
      
      let estadoMap: Record<number, string> = {};
      try {
        const estadosData: any = await this.httpApi.getAllEstadoEntregaRecolha();
        const estados = Array.isArray(estadosData) ? estadosData : (estadosData?.data || []);
        for (const e of estados) {
          const estadoId = Number(e.id_estado ?? e.id_estado_entrega_recolha ?? e.id ?? 0);
          const descr = e.descr ?? e.description ?? e.estado ?? e.nome ?? '';
          if (estadoId && descr) {
            estadoMap[estadoId] = descr;
          }
        }
      } catch (eErr) {
        console.warn('Could not load estado_entrega_recolha', eErr);
      }
      
      let entregas: any[] = [];
      try {
        const entregasData: any = await this.httpApi.getAllEntregasRecolhas();
        entregas = Array.isArray(entregasData) ? entregasData : (entregasData?.data || []);
      } catch (eErr) {
        console.warn('Could not load entregas_recolhas', eErr);
      }
      
      const entregasByMochila: Record<string, any> = {};
      for (const e of entregas) {
        const mochilaId = String(e.id_mochila ?? e.mochila_id ?? '');
        const estado = Number(e.id_estado_entrega_recolha ?? e.estado ?? 0);
        entregasByMochila[mochilaId] = { ...e, estadoDescr: estadoMap[estado] || `Estado ${estado}` };
      }
      
      //Filtra mochilas a mostrar
      let filtered: any[] = [];

      const roleText = String((user?.profileType || '')).toLowerCase();
      const isAdmin = roleText.includes('admin') || roleText.includes('administrador');

      if (isAdmin) {
        filtered = all || [];
      } else if (user && (user.id_utilizador !== undefined && user.id_utilizador !== null)) {
        const uid = String(user.id_utilizador);
        filtered = (all || []).filter((m: any) => String(m.id_user ?? m.id_utilizador ?? '') === uid);
      } else {
        filtered = [];
      }

      // Mapeia donos e adiciona status de entrega
      this.mochilas = (filtered || []).map((m: any) => {
        const ownerId = String(m.id_user ?? m.id_utilizador ?? '');
        const mochilaId = String(m.id_mochila ?? m.id ?? '');
        const entrega = entregasByMochila[mochilaId];
        return {
          ...m,
          ownerEmail: usersById[ownerId] || '',
          entregaStatus: entrega ? entrega.estadoDescr : null
        };
      });
    } catch (err) {
      console.error('Error loading mochilas', err);
    } finally {
      this.loading = false;
    }
  }

}

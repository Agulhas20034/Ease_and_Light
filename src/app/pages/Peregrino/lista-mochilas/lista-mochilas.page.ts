import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase/supabase';
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

  constructor(private supabase: SupabaseService, public t: TranslationService) { }

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
      const all = await this.supabase.getAllMochilas();
      const user = this.currentUser;

      // Carregar users para mapear donos
      let users: any[] = [];
      try {
        users = await this.supabase.getAllUsers() || [];
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
      //Filtra mochilas a mostrar
      let filtered: any[] = [];

      let isAdmin = false;
      try {
        const tipos = await this.supabase.getAllTipoPerfil();
        const adminTipo = (tipos || []).find((t: any) => {
          const n = ((t.nome || t.descr || t.descricao) || '').toString().toLowerCase();
          return n.includes('admin') || n.includes('administrador');
        });
        const roleText = String((user?.profileType || '')).toLowerCase();
        if (roleText.includes('admin') || roleText.includes('administrador')) isAdmin = true;
        if (!isAdmin && adminTipo && user && (user.id_tipo !== undefined && user.id_tipo !== null)) {
          if (String(user.id_tipo) === String(adminTipo.id_tipo)) isAdmin = true;
        }
      } catch (tErr) {
        console.warn('Could not fetch tipo_perfil for admin detection', tErr);
      }

      if (isAdmin) {
        filtered = all || [];
      } else if (user && (user.id_utilizador !== undefined && user.id_utilizador !== null)) {
        const uid = String(user.id_utilizador);
        filtered = (all || []).filter((m: any) => String(m.id_user ?? m.id_utilizador ?? '') === uid);
      } else {
        filtered = [];
      }

      // Mapeia donos
      this.mochilas = (filtered || []).map((m: any) => {
        const ownerId = String(m.id_user ?? m.id_utilizador ?? '');
        return { ...m, ownerEmail: usersById[ownerId] || '' };
      });
    } catch (err) {
      console.error('Error loading mochilas', err);
    } finally {
      this.loading = false;
    }
  }

}

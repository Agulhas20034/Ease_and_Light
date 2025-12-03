import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase/supabase';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslationService } from '../../services/translations/translation.service';

@Component({ selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: false,
})
export class FolderPage implements OnInit {
  items: any[] = [];
  public folder!: string;
  public errorMsg: string | null = null;
  
  constructor(
    private supabase: SupabaseService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public tService: TranslationService
  ) {}

  get langCode() {
    try {
      return this.tService.getLang().toUpperCase();
    } catch {
      return 'PT';
    }
  }

  async ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
    try {
      const data = await this.supabase.fetchAll('tipo_perfil');
      console.log('tipo_perfil response:', data);
      this.items = data || [];
    } catch (err) {
      console.error('Error fetching items', err);
      this.errorMsg = (err as any)?.message || String(err);
    }
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  toggleLang() {
    this.tService.toggleLang();
  }

  t(key: string) {
    return this.tService.translate(key);
  }

  getDisplayText(item: any): string {
    if (item == null) return '';
    if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') return String(item);

    const candidates = ['nome', 'name', 'title', 'descricao', 'description', 'label', 'id_utilizador', 'id'];
    for (const key of candidates) {
      if (Object.prototype.hasOwnProperty.call(item, key) && item[key] != null) {
        return String(item[key]);
      }
    }

    for (const k of Object.keys(item)) {
      const v = item[k];
      if (typeof v === 'string' && v.trim().length) return v;
    }

    try {
      const json = JSON.stringify(item);
      return json.length > 120 ? json.slice(0, 117) + '...' : json;
    } catch {
      return String(item);
    }
  }
}

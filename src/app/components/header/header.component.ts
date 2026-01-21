import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SupabaseService } from '../../services/supabase/supabase';
import { TranslationService } from '../../services/translations/translation.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  public pageTitle: string = '';
  private sub: Subscription | null = null;
  private langSub: Subscription | null = null;
  public logoutLabel: string = '';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private supabase: SupabaseService,
    public tService: TranslationService
  ) {}

  ngOnInit() {
    this.updateTitle();
    this.sub = this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => this.updateTitle());
    this.langSub = this.tService.asObservable().subscribe(() => {
      this.updateTitle();
      this.logoutLabel = this.tService.translate('logout');
    });
    this.logoutLabel = this.tService.translate('logout');
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    if (this.langSub) this.langSub.unsubscribe();
  }

  private updateTitle() {
    if (this.title && this.title.length) {
      const t = this.tService.translate(this.title);
      this.pageTitle = t !== this.title ? t : this.title;
      return;
    }

    try {
      let route = this.activatedRoute as ActivatedRoute;
      while (route.firstChild) route = route.firstChild;
      const data: any = route.snapshot.data || {};
      if (data['titleKey']) {
        this.pageTitle = this.tService.translate(data['titleKey']);
        return;
      }
      if (data['title']) {
        const translated = this.tService.translate(data['title']);
        this.pageTitle = translated !== data['title'] ? translated : data['title'];
        return;
      }
      let url = this.router.url || '';
      // strip query and fragment so titles don't include ?id=123 or #anchor
      url = String(url).split('?')[0].split('#')[0];
      const parts = url.split('/').filter(p => !!p);
      if (parts.length) {
        const raw = parts[parts.length - 1];
        const candidates = [
          raw,
          raw.replace(/-/g, '_'),
          raw.replace(/-/g, ' '),
          raw.replace(/-/g, '_').toLowerCase(),
        ];
        let found = '';
        for (const c of candidates) {
          const key = c.trim();
          const translated = this.tService.translate(key);
          if (translated && translated !== key) {
            found = translated;
            break;
          }
        }
        if (found) {
          this.pageTitle = found;
        } else {
          const last = raw.replace(/-/g, ' ');
          this.pageTitle = this.capitalize(last);
        }
      } else {
        const home = this.tService.translate('home');
        this.pageTitle = home !== 'home' ? home : 'Home';
      }
    } catch {
      this.pageTitle = '';
    }
  }

  private capitalize(s: string) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  shouldShow(): boolean {
    try {
      const url = this.router.url || '';
      const hidden = ['/login', '/register', '/splash'];
      return !hidden.some(h => url.startsWith(h));
    } catch {
      return true;
    }
  }

  get langCode() {
    try { return this.tService.getLang().toUpperCase(); } catch { return 'PT'; }
  }

  toggleLang() {
    this.tService.toggleLang();
  }

  showBackButton(): boolean {
    try {
      const url = this.router.url || '';
      
      return !url.startsWith('/folder');
    } catch {
      return true;
    }
  }

  goBack() {
    window.history.back();
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}

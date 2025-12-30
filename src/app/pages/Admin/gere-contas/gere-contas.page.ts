import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase/supabase';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-gere-contas',
  templateUrl: './gere-contas.page.html',
  styleUrls: ['./gere-contas.page.scss'],
  standalone: false,
})
export class GereContasPage implements OnInit {
  users: any[] = [];
  loading = false;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private toastCtrl: ToastController,
    public t: TranslationService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  ionViewWillEnter() {
    this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    try {
      const data: any = await this.supabase.getAllUsers();
      this.users = Array.isArray(data) ? data : (data?.data || []);
    } catch (e) {
      console.error('Failed to load users', e);
      const t = await this.toastCtrl.create({ message: this.t.translate('loading_failed'), duration: 2000, color: 'danger' });
      t.present();
    } finally {
      this.loading = false;
    }
  }

  edit(u: any) {
    this.router.navigate(['/edita-conta'], { queryParams: { id: u.id_utilizador } });
  }

  async toggleActive(u: any) {
    const newEstado = (Number(u.estado) === 1) ? 2 : 1;
    try {
      await this.supabase.updateUser(u.id_utilizador, { estado: newEstado });
      const msg = newEstado === 1 ? this.t.translate('account_activated') : this.t.translate('account_deactivated');
      const t = await this.toastCtrl.create({ message: msg, duration: 1500, color: 'success' });
      t.present();
      this.loadUsers();
    } catch (e) {
      console.error('Toggle failed', e);
      const t = await this.toastCtrl.create({ message: this.t.translate('toggle_error'), duration: 2000, color: 'danger' });
      t.present();
    }
  }
}

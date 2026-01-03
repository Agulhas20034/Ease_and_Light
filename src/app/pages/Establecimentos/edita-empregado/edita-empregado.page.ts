import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase/supabase';
import { TranslationService } from 'src/app/services/translations/translation.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-edita-empregado',
  templateUrl: './edita-empregado.page.html',
  styleUrls: ['./edita-empregado.page.scss'],
  standalone: false,
})
export class EditaEmpregadoPage implements OnInit {
  userId: number | null = null;
  loading = false;
  nome = '';
  email = '';
  telefone = '';
  nif = '';
  passaporte = '';
  estado: number = 1;

  constructor(
    private act: ActivatedRoute,
    private supabase: SupabaseService,
    private router: Router,
    private toastCtrl: ToastController,
    public t: TranslationService
  ) {}

  ngOnInit() {
    // Ler query param id do funcionário a editar
    this.act.queryParams.subscribe((p) => {
      if (p && p['id']) this.userId = Number(p['id']);
      if (this.userId) this.loadUser();
    });
  }

  // Carrega os dados do utilizador para popular o formulário
  async loadUser() {
    if (!this.userId) return;
    this.loading = true;
    try {
      const u: any = await this.supabase.getUser(this.userId);
      if (u) {
        this.nome = u.nome || '';
        this.email = u.email || '';
        this.telefone = u.telefone || '';
        this.nif = u.nif || '';
        this.passaporte = u.passaporte || '';
        this.estado = Number(u.estado) || 1;
      }
    } catch (e) {
      console.error('Erro ao carregar utilizador', e);
    } finally {
      this.loading = false;
    }
  }

  isTelefoneValid(): boolean {
    const cleaned = (this.telefone || '').replace(/\D/g, '');
    return cleaned.length >= 9;
  }

  isNifValid(): boolean {
    const cleaned = (this.nif || '').replace(/\D/g, '');
    return cleaned.length === 9;
  }

  tKey(k: string) { return this.t.translate(k); }

  // Guarda alterações do empregado
  async save() {
    if (!this.userId) return;
    if (this.telefone && !this.isTelefoneValid()) {
      const toast = await this.toastCtrl.create({ message: this.tKey('phone_invalid'), duration: 2000, color: 'warning' });
      toast.present();
      return;
    }
    if (this.nif && !this.isNifValid()) {
      const toast = await this.toastCtrl.create({ message: this.tKey('nif_invalid'), duration: 2000, color: 'warning' });
      toast.present();
      return;
    }

    this.loading = true;
    try {
      // Verifica se o NIF já existe em outro utilizador (permitir manter o mesmo NIF do próprio utilizador)
      if (this.nif) {
        const taken = await this.supabase.isNifTakenByOther(this.nif, this.userId);
        if (taken) {
          const toast = await this.toastCtrl.create({ message: this.tKey('nif_in_use'), duration: 2000, color: 'warning' });
          toast.present();
          this.loading = false;
          return;
        }
      }
      await this.supabase.updateUser(this.userId, {
        nome: this.nome || null,
        telefone: this.telefone || null,
        nif: this.nif || null,
        passaporte: this.passaporte || null,
        estado: this.estado
      });
      const toast = await this.toastCtrl.create({ message: this.tKey('edit_saved'), duration: 1500, color: 'success' });
      toast.present();
      setTimeout(() => this.router.navigate(['/lista-empregados'], { queryParams: { id: null } }), 600);
    } catch (e: any) {
      console.error('Erro ao guardar empregado', e);
      const toast = await this.toastCtrl.create({ message: e?.message || this.tKey('save_error'), duration: 2000, color: 'danger' });
      toast.present();
    } finally {
      this.loading = false;
    }
  }
}

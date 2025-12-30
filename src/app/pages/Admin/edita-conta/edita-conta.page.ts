import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase/supabase';
import { ToastController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-edita-conta',
  templateUrl: './edita-conta.page.html',
  styleUrls: ['./edita-conta.page.scss'],
  standalone: false,
})
export class EditaContaPage implements OnInit {
  id: number | null = null;
  nome = '';
  email = '';
  telefone: string | null = null;
  id_tipo: number | null = null;
  tipos: any[] = [];
  nacionalidade: string | null = null;
  nif: string | null = null;
  passaporte: string | null = null;
  // valores originais para evitar verificações de unicidade desnecessárias
  origTelefone: string | null = null;
  origNif: string | null = null;
  origPassaporte: string | null = null;
  estado: number | null = null;
  // campos de senha para atualização
  newPassword: string = '';
  confirmPassword: string = '';
  passwordFeedback: string[] = [];
  passwordIsValid: boolean = false;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabase: SupabaseService,
    private toastCtrl: ToastController,
    public t: TranslationService
  ) {}

  async ngOnInit() {
    // carregar tipos de perfil para o select
    try {
      const tiposData: any = await this.supabase.getAllTipoPerfil();
      this.tipos = Array.isArray(tiposData) ? tiposData : (tiposData?.data || []);
    } catch (e) {
      console.warn('Could not load profile types', e);
    }

    this.route.queryParams.subscribe(async params => {
      const id = params['id'];
      if (id) {
        this.id = Number(id);
        await this.loadUser();
      }
    });
  }

  async loadUser() {
    if (!this.id) return;
    this.loading = true;
    try {
      const u: any = await this.supabase.getUser(this.id);
      if (u) {
        this.nome = u.nome || '';
        this.email = u.email || '';
        this.telefone = u.telefone || null;
        this.id_tipo = u.id_tipo || null;
        this.nacionalidade = u.nacionalidade || null;
        this.nif = u.nif || null;
        this.passaporte = u.passaporte || null;
        this.estado = u.estado ?? null;
        // guardar os valores originais
        this.origTelefone = u.telefone || null;
        this.origNif = u.nif || null;
        this.origPassaporte = u.passaporte || null;
      }
    } catch (e) {
      console.error('Load user failed', e);
    } finally {
      this.loading = false;
    }
  }

  onPasswordChange() {
    if (!this.newPassword) {
      this.passwordFeedback = [];
      this.passwordIsValid = false;
      return;
    }
    const validation = this.supabase.validatePassword(this.newPassword);
    this.passwordFeedback = validation.feedback || [];
    this.passwordIsValid = validation.isValid;
  }

  async save() {
    if (!this.id) return;
    this.loading = true;
    try {
      // Validar a senha se o utilizador forneceu uma
      if (this.newPassword) {
        if (this.newPassword !== this.confirmPassword) {
          const t = await this.toastCtrl.create({ message: this.t.translate('passwords_not_match'), duration: 2000, color: 'warning' });
          t.present();
          this.loading = false;
          return;
        }
        const validation = this.supabase.validatePassword(this.newPassword);
        if (!validation.isValid) {
          const t = await this.toastCtrl.create({ message: this.t.translate('pw_len'), duration: 2000, color: 'warning' });
          t.present();
          this.loading = false;
          return;
        }
        // atualizar a senha (o hash é tratado no serviço)
        await this.supabase.updateUserPassword(this.id, this.newPassword);
      }

      const updates: any = {
        nome: this.nome,
        id_tipo: this.id_tipo,
        nacionalidade: this.nacionalidade
      };

      // incluir telefone/nif/passaporte apenas quando tiverem sido alterados
      const telCur = (this.telefone ?? '').toString();
      const telOrig = (this.origTelefone ?? '').toString();
      if (telCur !== telOrig) updates.telefone = this.telefone;

      const nifCur = (this.nif ?? '').toString();
      const nifOrig = (this.origNif ?? '').toString();
      if (nifCur !== nifOrig) updates.nif = this.nif;

      const passCur = (this.passaporte ?? '').toString();
      const passOrig = (this.origPassaporte ?? '').toString();
      if (passCur !== passOrig) updates.passaporte = this.passaporte;
      await this.supabase.updateUser(this.id, updates);
      const t = await this.toastCtrl.create({ message: this.t.translate('edit_saved'), duration: 1500, color: 'success' });
      t.present();
      this.router.navigate(['/gere-contas']);
    } catch (e) {
      console.error('Save failed', e);
      const t = await this.toastCtrl.create({ message: this.t.translate('save_error'), duration: 2000, color: 'danger' });
      t.present();
    } finally {
      this.loading = false;
    }
  }
}

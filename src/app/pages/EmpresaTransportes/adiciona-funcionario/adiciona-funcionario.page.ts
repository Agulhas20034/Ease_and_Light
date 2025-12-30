import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase/supabase';
import { ToastController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-adiciona-funcionario',
  templateUrl: './adiciona-funcionario.page.html',
  styleUrls: ['./adiciona-funcionario.page.scss'],
  standalone: false,
})
export class AdicionaFuncionarioPage implements OnInit {
  empresaId: number | null = null;
  email = '';
  password = '';
  confirmPassword = '';
  nome = '';
  telefone = '';
  nacionalidade = '';
  nif = '';
  passaporte = '';
  loading = false;
  showPassword = false;
  showConfirmPassword = false;
  passwordFeedback: string[] = [];
  passwordIsValid = false;

  constructor(
    private act: ActivatedRoute,
    private supabase: SupabaseService,
    private router: Router,
    private toastCtrl: ToastController,
    public t: TranslationService
  ) {}

  ngOnInit() {
    this.act.queryParams.subscribe(p => { if (p['id']) this.empresaId = Number(p['id']); });
  }

  tKey(k: string) { return this.t.translate(k); }

  onPasswordChange() {
    const validation = this.supabase.validatePassword(this.password);
    this.passwordFeedback = validation.feedback;
    this.passwordIsValid = validation.isValid;
  }

  isTelefoneValid(): boolean {
    const cleaned = (this.telefone || '').replace(/\D/g, '');
    return cleaned.length >= 9;
  }

  isNifValid(): boolean {
    const cleaned = (this.nif || '').replace(/\D/g, '');
    return cleaned.length === 9;
  }

  togglePasswordVisibility() { this.showPassword = !this.showPassword; }
  toggleConfirmPasswordVisibility() { this.showConfirmPassword = !this.showConfirmPassword; }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    toast.present();
  }

  async createEmployee() {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.showToast(this.tKey('provide_nif_or_passport'), 'warning');
      return;
    }
    if (!this.passwordIsValid) {
      this.showToast(this.tKey('pw_len'), 'warning');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.showToast(this.tKey('passwords_not_match'), 'warning');
      return;
    }

    if (!this.nif && !this.passaporte) {
      this.showToast(this.tKey('provide_nif_or_passport'), 'warning');
      return;
    }

    if (this.telefone && !this.isTelefoneValid()) {
      this.showToast(this.tKey('phone_invalid'), 'warning');
      return;
    }
    if (this.nif && !this.isNifValid()) {
      this.showToast(this.tKey('nif_invalid'), 'warning');
      return;
    }

    this.loading = true;
    try {
      // Verifica previamente unicidade para evitar criar um utilizador que depois falhará ao atualizar
      if (this.telefone) {
        const takenTel = await this.supabase.isTelefoneTaken(this.telefone);
        if (takenTel) {
          this.showToast(this.tKey('phone_in_use') || this.tKey('phone_invalid'), 'warning');
          this.loading = false;
          return;
        }
      }
      if (this.nif) {
        const takenNif = await this.supabase.isNifTaken(this.nif);
        if (takenNif) {
          this.showToast(this.tKey('nif_in_use') || this.tKey('nif_invalid'), 'warning');
          this.loading = false;
          return;
        }
      }
      if (this.passaporte) {
        const takenPass = await this.supabase.isPassaporteTaken(this.passaporte);
        if (takenPass) {
          this.showToast(this.tKey('passport_in_use') || this.tKey('provide_nif_or_passport'), 'warning');
          this.loading = false;
          return;
        }
      }
      // registerUser devolve a(s) linha(s) inserida(s); capturar o retorno para obter o novo ID com fiabilidade
      const createdRec: any = await this.supabase.registerUser(this.email, this.password, this.nome);
      let userId: number | null = null;
      if (Array.isArray(createdRec) && createdRec.length) {
        userId = createdRec[0].id_utilizador || createdRec[0].id;
      } else if (createdRec && createdRec.id_utilizador) {
        userId = createdRec.id_utilizador;
      }

      // Alternativa: procurar por email se não obtivemos um id
      if (!userId) {
        const looked = await this.supabase.getUserByEmail(this.email);
        userId = looked?.id_utilizador || looked?.id || null;
      }

      if (userId) {
        try {
          await this.supabase.updateUser(userId, {
            telefone: this.telefone || null,
            id_tipo: 3,
            nacionalidade: this.nacionalidade || null,
            nif: this.nif || null,
            passaporte: this.passaporte || null,
            estado: 1
          });
        } catch (updateErr: any) {
          console.error('Failed to update created user fields', updateErr);
          // Tentar reverter (rollback) o utilizador criado para não deixar uma conta parcialmente criada
          try {
            await this.supabase.deleteUser(userId);
          } catch (delErr) {
            console.warn('Failed to rollback created user', delErr);
          }
          // mostrar erro e abortar
          this.showToast((updateErr && updateErr.message) ? updateErr.message : this.tKey('save_error'), 'danger');
          this.loading = false;
          return;
        }

        if (this.empresaId) {
          try {
            await this.supabase.addUserEmpresa(userId, this.empresaId);
          } catch (e: any) {
            console.warn('associate failed', e);
            // Tentar rollback: remover o utilizador criado se a associação falhar
            try {
              await this.supabase.deleteUser(userId);
            } catch (delErr) {
              console.warn('Failed to rollback created user after association failure', delErr);
            }
            this.showToast((e && e.message) ? e.message : this.tKey('save_error'), 'danger');
            this.loading = false;
            return;
          }
        }

        this.showToast(this.tKey('edit_saved'), 'success');
        setTimeout(() => this.router.navigate(['/lista-funcionarios'], { queryParams: { id: this.empresaId } }), 800);
        return;
      }

      this.showToast(this.tKey('save_error'), 'danger');
    } catch (e: any) {
      console.error('Create employee failed', e);
      this.showToast(e?.message || this.tKey('save_error'), 'danger');
    } finally {
      this.loading = false;
    }
  }
}
  

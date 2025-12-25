import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, MenuController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase/supabase';
import { TranslationService } from '../../services/translations/translation.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  nome: string = '';
  telefone: string = '';
  tipoPerfil: number | null = 5;
  nacionalidade: string = '';
  nif: string = '';
  passaporte: string = '';
  loading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  passwordFeedback: string[] = [];
  passwordIsValid: boolean = false;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private toastController: ToastController,
    private menu: MenuController,
    public tService: TranslationService
  ) {}

  async ngOnInit() {
    try {
      const tipos: any = await this.supabase.getAllTipoPerfil();
      if (Array.isArray(tipos) && tipos.length) {
        if (!this.tipoPerfil) this.tipoPerfil = tipos[0].id_tipo;
      }
    } catch (e) {
    }
  }

  ionViewWillEnter() {
    this.menu.enable(false);
  }

  ionViewWillLeave() {
    this.menu.enable(true);
  }

  t(key: string) {
    return this.tService.translate(key);
  }

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

  async register() {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.showToast('Please fill in all fields', 'warning');
      return;
    }

    if (!this.passwordIsValid) {
      this.showToast('Password does not meet requirements', 'warning');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showToast('Passwords do not match', 'warning');
      return;
    }

    this.loading = true;
    try {
      if (!this.nif && !this.passaporte) {
        this.showToast(this.t('provide_nif_or_passport'), 'warning');
        this.loading = false;
        return;
      }

      if (this.telefone && !this.isTelefoneValid()) {
        this.showToast(this.t('telefone_invalid'), 'warning');
        this.loading = false;
        return;
      }
      if (this.nif && !this.isNifValid()) {
        this.showToast(this.t('nif_invalid'), 'warning');
        this.loading = false;
        return;
      }

      const rec: any = {
        email: this.email,
        password: this.password,
        nome: this.nome,
        telefone: this.telefone || null,
        id_tipo: this.tipoPerfil ?? 5,
        nacionalidade: this.nacionalidade || null,
        nif: this.nif || null,
        passaporte: this.passaporte || null
      };

    
      if (this.telefone) {
        const telTaken = await this.supabase.isTelefoneTaken(this.telefone);
        if (telTaken) {
          this.showToast(this.t('telefone_invalid') + ' — already in use', 'warning');
          this.loading = false;
          return;
        }
      }
      if (this.nif) {
        const nifTaken = await this.supabase.isNifTaken(this.nif);
        if (nifTaken) {
          this.showToast(this.t('nif_invalid') + ' — already in use', 'warning');
          this.loading = false;
          return;
        }
      }
      if (this.passaporte) {
        const passTaken = await this.supabase.isPassaporteTaken(this.passaporte);
        if (passTaken) {
          this.showToast(this.t('passaporte') + ' — already in use', 'warning');
          this.loading = false;
          return;
        }
      }

      await this.supabase.registerUser(this.email, this.password, this.nome);
      const created = await this.supabase.getUserByEmail(this.email);
      if (created) {
        await this.supabase.updateUser(created.id_utilizador, {
          telefone: rec.telefone,
          id_tipo: rec.id_tipo,
          nacionalidade: rec.nacionalidade,
          nif: rec.nif,
          passaporte: rec.passaporte
        });
      }
      this.showToast('Account created successfully!', 'success');
      setTimeout(() => this.router.navigate(['/login']), 1500);
    } catch (error: any) {
      this.showToast(error.message || 'Registration failed', 'danger');
    } finally {
      this.loading = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    toast.present();
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, MenuController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase/supabase';
import { TranslationService } from '../../services/translations/translation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private toastController: ToastController,
    private menu: MenuController,
    public tService: TranslationService
  ) {}

  ionViewWillEnter() {
    this.menu.enable(false);
  }

  ionViewWillLeave() {
    this.menu.enable(true);
  }

  t(key: string) {
    return this.tService.translate(key);
  }

  async login() {
    if (!this.email || !this.password) {
      this.showToast(this.t('provide_all_fields') || 'Please fill in all fields', 'warning');
      return;
    }

    this.loading = true;
    try {
      const user: any = await this.supabase.loginUser(this.email, this.password);

      // apenas permitir utilizadores com estado === 1
      if (typeof user.estado !== 'undefined' && Number(user.estado) !== 1) {
        this.showToast(this.t('account_inactive') || 'Account is not active', 'warning');
        this.loading = false;
        return;
      }

      // obter descrição do tipo de perfil (ex: 'Administrador') e armazenar no localStorage
      let profileType = 'User';
      if (user.id_tipo) {
        try {
          const profileData = await this.supabase.fetchProfileType(user.id_tipo);
          if (profileData && profileData.descr) profileType = profileData.descr;
        } catch (e) {
          console.warn('Could not fetch profile type:', e);
        }
      }

      const userWithProfile = { ...user, profileType, id_tipo: user.id_tipo };
      localStorage.setItem('currentUser', JSON.stringify(userWithProfile));
      this.showToast(this.t('login_successful') || 'Login successful!', 'success');
      this.router.navigate(['/folder/inbox']);
    } catch (error: any) {
      this.showToast(error.message || 'Login failed', 'danger');
    } finally {
      this.loading = false;
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
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

import { Component } from '@angular/core';
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
export class RegisterPage {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  nome: string = '';
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
      await this.supabase.registerUser(this.email, this.password, this.nome);
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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, MenuController } from '@ionic/angular';
import { HttpApiService } from '../../services/http-api/http-api.service';
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
    private httpApi: HttpApiService,
    private router: Router,
    private toastController: ToastController,
    private menu: MenuController,
    public tService: TranslationService
  ) {}

  async ngOnInit() {
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
    const feedback: string[] = [];
    if (this.password.length < 8) feedback.push('pw_len');
    if (!/[A-Z]/.test(this.password)) feedback.push('pw_upper');
    if (!/[a-z]/.test(this.password)) feedback.push('pw_lower');
    if (!/[0-9]/.test(this.password)) feedback.push('pw_number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.password)) feedback.push('pw_special');
    this.passwordFeedback = feedback;
    this.passwordIsValid = feedback.length === 0;
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
      const additionalData: any = {
        id_tipo: this.tipoPerfil ?? 5,
        telefone: this.telefone || null,
        nacionalidade: this.nacionalidade || null,
        nif: this.nif || null,
        passaporte: this.passaporte || null
      };

      await this.httpApi.register(this.email, this.password, this.nome, additionalData);
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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpApiService } from 'src/app/services/http-api/http-api.service';
import { ToastController } from '@ionic/angular';
import { TranslationService } from 'src/app/services/translations/translation.service';

@Component({
  selector: 'app-cria-empregado',
  templateUrl: './cria-empregado.page.html',
  styleUrls: ['./cria-empregado.page.scss'],
  standalone: false,
})
export class CriaEmpregadoPage implements OnInit {
  estabId: number | null = null;
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
    private httpApi: HttpApiService,
    private router: Router,
    private toastCtrl: ToastController,
    public t: TranslationService
  ) {}

  ngOnInit() {
    this.act.queryParams.subscribe((p) => {
      if (p && p['id']) this.estabId = Number(p['id']);
      console.log('cria-empregado ngOnInit: queryParams', p, 'estabId set to', this.estabId);
    });
  }

  tKey(k: string) {
    return this.t.translate(k);
  }

  onPasswordChange() {
    const validation = this.httpApi.validatePassword(this.password);
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    toast.present();
  }

  // Cria um empregado, define id_tipo = 6 e associa ao estabelecimento
  async createEmployee() {
    console.log('createEmployee called, estabId:', this.estabId, 'form data:', {
      email: this.email,
      telefone: this.telefone,
      nif: this.nif,
      nome: this.nome
    });
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
      if (this.telefone) {
        const takenTel = await this.httpApi.isTelefoneTaken(this.telefone);
        if (takenTel) {
          this.showToast(this.tKey('phone_in_use') || this.tKey('phone_invalid'), 'warning');
          this.loading = false;
          return;
        }
      }
      if (this.nif) {
        const takenNif = await this.httpApi.isNifTaken(this.nif);
        if (takenNif) {
          this.showToast(this.tKey('nif_in_use') || this.tKey('nif_invalid'), 'warning');
          this.loading = false;
          return;
        }
      }
      if (this.passaporte) {
        const takenPass = await this.httpApi.isPassaporteTaken(this.passaporte);
        if (takenPass) {
          this.showToast(this.tKey('passport_in_use') || this.tKey('provide_nif_or_passport'), 'warning');
          this.loading = false;
          return;
        }
      }

      // Registar utilizador (usa registerUser para criar auth também)
      const createdRec: any = await this.httpApi.register(this.email, this.password, this.nome, {
        telefone: this.telefone,
        nif: this.nif,
        passaporte: this.passaporte,
        nacionalidade: this.nacionalidade,
        id_tipo: 6,
        estado: 1
      });
      console.log('Register result:', createdRec);
      let userId: number | null = null;
      if (Array.isArray(createdRec) && createdRec.length) {
        userId = createdRec[0].id_utilizador || createdRec[0].id;
      } else if (createdRec && createdRec.id_utilizador) {
        userId = createdRec.id_utilizador;
      }
      console.log('Extracted userId:', userId);

      if (!userId) {
        const looked = userId ? await this.httpApi.getUser(userId) : null;
        userId = looked?.id_utilizador || looked?.id || null;
      }

      if (userId && this.estabId) {
        console.log('Attempting association: userId', userId, 'estabId', this.estabId);
        try {
          await this.httpApi.addUserEstabelecimento(userId, this.estabId);
          console.log('Association successful');
        } catch (e: any) {
          console.warn('associate failed', e);
          try {
            await this.httpApi.deleteUser(userId);
          } catch (delErr) {
            console.warn('Failed to rollback created user after association failure', delErr);
          }
          this.showToast((e && e.message) ? e.message : this.tKey('save_error'), 'danger');
          this.loading = false;
          return;
        }
      }

      this.showToast(this.tKey('edit_saved'), 'success');
      setTimeout(() => this.router.navigate(['/lista-empregados'], { queryParams: { id: this.estabId } }), 800);
      return;
    } catch (e: any) {
      console.error('Create employee failed', e);
      this.showToast(e?.message || this.tKey('save_error'), 'danger');
    } finally {
      this.loading = false;
    }
  }
}

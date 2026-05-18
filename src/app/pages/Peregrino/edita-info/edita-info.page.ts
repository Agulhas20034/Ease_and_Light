import { Component, OnInit } from '@angular/core';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { TranslationService } from '../../../services/translations/translation.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edita-info',
  templateUrl: './edita-info.page.html',
  styleUrls: ['./edita-info.page.scss'],
  standalone: false,
})
export class EditaInfoPage implements OnInit {
  user: any = {};
  originalUser: any = {};
  originalUserId: number | null = null;
  saving = false;

  constructor(
    private httpApi: HttpApiService,
    public tService: TranslationService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {}

  t(key: string) {
    return this.tService.translate(key);
  }

  ngOnInit() {
    try {
      const stored = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (!stored) {
        this.router.navigateByUrl('/login');
        return;
      }

      this.user = Object.assign({}, stored);
      this.originalUser = Object.assign({}, stored);
      this.originalUserId = stored.id_utilizador || stored.id || null;
    } catch (e) {
      this.presentToast('Failed to load user data');
    }
  }

  async presentToast(msg: string, duration = 2500) {
    const t = await this.toastCtrl.create({ message: msg, duration });
    await t.present();
  }

  async save() {
    if (!this.originalUserId) {
      this.presentToast('Unable to determine current user id');
      return;
    }

    this.saving = true;
    const loading = await this.loadingCtrl.create({ message: 'Saving...' });
    await loading.present();

    try {
      if (this.user.telefone && String(this.user.telefone) !== String(this.originalUser.telefone || '')) {
        const telefoneTaken = await this.httpApi.isTelefoneTaken(String(this.user.telefone));
        if (telefoneTaken) {
          await loading.dismiss();
          this.saving = false;
          this.presentToast('Telefone already in use by another account');
          return;
        }
      }

      if (this.user.nif && String(this.user.nif) !== String(this.originalUser.nif || '')) {
        const nifTaken = await this.httpApi.isNifTakenByOther(String(this.user.nif), Number(this.originalUserId));
        if (nifTaken) {
          await loading.dismiss();
          this.saving = false;
          this.presentToast('NIF already in use by another account');
          return;
        }
      }

      if (this.user.passaporte && String(this.user.passaporte) !== String(this.originalUser.passaporte || '')) {
        const allUsers: any[] = await this.httpApi.getAllUsers();
        const conflict = allUsers.find(u => String(u.passaporte) === String(this.user.passaporte)
          && Number(u.id_utilizador || u.id) !== Number(this.originalUserId));
        if (conflict) {
          await loading.dismiss();
          this.saving = false;
          this.presentToast('Passaporte already in use by another account');
          return;
        }
      }

      const payload: any = {
        nome: this.user.nome,
        telefone: this.user.telefone,
      };
      if (this.user.nif !== undefined) {
        payload.nif = this.user.nif || null;
      }
      if (this.user.passaporte !== undefined) {
        payload.passaporte = this.user.passaporte || null;
      }

      const currentStored = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const updated = await this.httpApi.updateUser(Number(this.originalUserId), payload);

      const newLocal = updated
        ? { ...currentStored, ...updated }
        : { ...currentStored, ...payload };
      localStorage.setItem('currentUser', JSON.stringify(newLocal));

      await loading.dismiss();
      this.saving = false;
      this.presentToast('Profile updated');
      this.router.navigateByUrl('/folder/inbox');
    } catch (e: any) {
      await loading.dismiss();
      this.saving = false;
      console.error('Error saving profile', e);
      this.presentToast('Failed to update profile');
    }
  }

}

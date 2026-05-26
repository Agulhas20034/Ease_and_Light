import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { TranslationService } from './services/translations/translation.service';
import { NotificationService } from './services/notification/notification.service';
import { HttpApiService } from './services/http-api/http-api.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(
    public tService: TranslationService,
    private notificationService: NotificationService,
    private alertCtrl: AlertController,
    private router: Router,
    private httpApi: HttpApiService
  ) {}

  ngOnInit() {
    this.notificationService.requestPermission();
  }

  get currentUser() {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch {
      return null;
    }
  }

  isProfileType(profileName: string): boolean {
    const user = this.currentUser;
    if (!user) return false;
    const stored = (user.profileType || user.id_tipo || '').toString();
    return stored === profileName.toString();
  }

  t(key: string) {
    return this.tService.translate(key);
  }

  async confirmDeactivateAccount() {
    const currentUser = this.currentUser;
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const alert = await this.alertCtrl.create({
      header: this.t('confirm') || 'Confirm',
      message: this.t('confirm_deactivate_account') || 'Are you sure you want to deactivate your account?',
      buttons: [
        { text: this.t('no') || 'No', role: 'cancel' },
        {
          text: this.t('yes') || 'Yes',
          handler: async () => {
            await this.deactivateAndLogout();
          }
        }
      ]
    });

    await alert.present();
  }

  private async deactivateAndLogout() {
    const currentUser = this.currentUser;
    if (!currentUser) {
      localStorage.removeItem('currentUser');
      this.router.navigate(['/login']);
      return;
    }

    const userId = currentUser.id_utilizador || currentUser.id || currentUser.id_user;
    if (userId) {
      try {
        await this.httpApi.updateUser(Number(userId), { estado: 2 });
      } catch (error) {
        console.error('Failed to deactivate account:', error);
      }
    }

    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}

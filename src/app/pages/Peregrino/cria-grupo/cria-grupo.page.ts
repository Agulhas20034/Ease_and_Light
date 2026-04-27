import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-cria-grupo',
  templateUrl: './cria-grupo.page.html',
  styleUrls: ['./cria-grupo.page.scss'],
  standalone: false,
})
export class CriaGrupoPage implements OnInit {
  public group: any = {
    name: '',
    description: ''
  };
  public loading = false;
  public currentUser: any = null;

  constructor(
    private httpApi: HttpApiService,
    private router: Router,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef,
    public t: TranslationService
  ) { }

  ngOnInit() {
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUser = JSON.parse(user);
    }
  }

  async saveGroup() {
    if (!this.group.name || !this.group.name.trim()) {
      this.showToast(this.t.translate('group_name_required'), 'warning');
      return;
    }

    if (!this.currentUser) {
      this.showToast(this.t.translate('user_not_authenticated'), 'danger');
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    const loadingTimeout = setTimeout(() => {
      console.log('Group creation timeout, forcing loading to false');
      this.loading = false;
      this.cdr.detectChanges();
    }, 30000);

    try {
      const payload = {
        nome: this.group.name.trim(),
        descr: this.group.description?.trim() || '',
        hora_criacao: new Date().toISOString(),
        estado: 1,
        members: [this.currentUser.id_utilizador || this.currentUser.id],
        createdBy: {
          id_utilizador: this.currentUser.id_utilizador || this.currentUser.id,
          nome: this.currentUser.nome || this.currentUser.email,
          email: this.currentUser.email
        }
      };

      const result: any = await this.httpApi.createGroup(payload);
      const createdGroup = Array.isArray(result) ? result[0] : result;

      this.showToast(this.t.translate('group_created'), 'success');
      this.router.navigate(['/info-grupo', createdGroup?.id_grupo || createdGroup?.id || createdGroup?._id]);
    } catch (e) {
      console.error('Erro ao criar grupo', e);
      this.showToast(this.t.translate('error_creating_group'), 'danger');
    } finally {
      clearTimeout(loadingTimeout);
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';
import { HttpApiService } from '../../../services/http-api/http-api.service';

@Component({
  selector: 'app-edita-grupo',
  templateUrl: './edita-grupo.page.html',
  styleUrls: ['./edita-grupo.page.scss'],
  standalone: false,
})
export class EditaGrupoPage implements OnInit {
  public groupId: string = '';
  public groupName: string = '';
  public groupDescription: string = '';
  public loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public t: TranslationService,
    private httpApi: HttpApiService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.groupId = this.route.snapshot.params['id'];
    this.loadGroupData();
  }

  async loadGroupData() {
    try {
      this.loading = true;
      const result: any = await this.httpApi.getGroupById(this.groupId);
      if (result?.data) {
        this.groupName = result.data.nome;
        this.groupDescription = result.data.descr;
      }
    } catch (error) {
      console.error('Error loading group:', error);
      this.showToast(this.t.translate('error_loading_group'));
    } finally {
      this.loading = false;
    }
  }

  async saveChanges() {
    if (!this.groupName?.trim()) {
      this.showToast(this.t.translate('group_name_required'));
      return;
    }

    try {
      this.loading = true;
      const updateData = {
        nome: this.groupName.trim(),
        descr: this.groupDescription.trim()
      };

      await this.httpApi.updateGrupo(Number(this.groupId), updateData);
      this.showToast(this.t.translate('group_updated'));
      this.router.navigate(['/info-grupo', { id: this.groupId }]);
    } catch (error) {
      console.error('Error updating group:', error);
      this.showToast(this.t.translate('error_updating_group'));
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.router.navigate(['/info-grupo', { id: this.groupId }]);
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}

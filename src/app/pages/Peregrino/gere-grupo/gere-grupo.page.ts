import { Component, OnInit } from '@angular/core';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-gere-grupo',
  templateUrl: './gere-grupo.page.html',
  styleUrls: ['./gere-grupo.page.scss'],
  standalone: false,
})
export class GereGrupoPage implements OnInit {
  public groups: any[] = [];
  public pendingInvites: any[] = [];
  public loading = false;
  public currentUser: any = null;
  public unreadInvitesCount = 0;
  private previousInviteCount = 0;

  constructor(
    private httpApi: HttpApiService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    public t: TranslationService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadGroups();
  }

  ionViewWillEnter() {
    this.loadGroups();
    this.loadPendingInvites();
  }

  loadCurrentUser() {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUser = JSON.parse(user);
    }
  }

  async loadGroups() {
    this.loading = true;
    try {
      const user = localStorage.getItem('currentUser');
      if (user) {
        const userData = JSON.parse(user);
        const userId = userData.id_utilizador || userData.id;
        const userTipo = userData.id_tipo;
        
        const isAdmin = userTipo === 1;
        
        let allGroups: any[] = [];
        
        if (isAdmin) {
          const result: any = await this.httpApi.getAllGrupo();
          allGroups = Array.isArray(result) ? result : (result?.data || []);
          this.groups = allGroups.filter((g: any) => g.estado === 1);
        } else {
          const result: any = await this.httpApi.getGroupsByUser(userId);
          allGroups = Array.isArray(result) ? result : (result?.data || []);
          
          this.groups = allGroups.filter((g: any) => {
            const hasGrupoUser = !!g.grupo_user;
            const isAccepted = hasGrupoUser && g.grupo_user.some((gu: any) => 
              (String(gu.id_user) === String(userId)) && 
              gu.status_convite === 1
            );
            return isAccepted;
          });
        }
      }
    } catch (e) {
      console.error('Erro ao carregar grupos', e);
      this.showToast(this.t.translate('error_loading_group'), 'danger');
    } finally {
      this.loading = false;
    }
  }

  async loadPendingInvites() {
    try {
      const user = localStorage.getItem('currentUser');
      if (user) {
        const userData = JSON.parse(user);
        const userId = userData.id_utilizador || userData.id;
        
        const result: any = await this.httpApi.getGroupsByUser(userId);
        const allGroups = Array.isArray(result) ? result : (result?.data || []);
        
        this.pendingInvites = allGroups.filter((g: any) => {
          const hasGrupoUser = !!g.grupo_user;
          const isPending = hasGrupoUser && g.grupo_user.some((gu: any) => 
            (String(gu.id_user) === String(userId)) && 
            gu.status_convite === 2
          );
          return isPending;
        });
        
        this.unreadInvitesCount = this.pendingInvites.length;
        
        if (this.unreadInvitesCount > this.previousInviteCount) {
          const newInvites = this.pendingInvites.slice(this.previousInviteCount);
          for (const invite of newInvites) {
            await this.notificationService.notifyGroupInvite(invite.nome, 'Someone');
          }
        }
        
        this.previousInviteCount = this.unreadInvitesCount;
      }
    } catch (e) {
      console.error('Erro ao carregar convites pendentes', e);
    }
  }

  async acceptGroupInvite(invite: any) {
    try {
      const userId = this.currentUser.id_utilizador || this.currentUser.id;
      await this.httpApi.acceptGroupInvite(invite.id_grupo, userId);
      this.showToast(this.t.translate('invitation_accepted'), 'success');
      this.loadPendingInvites();
      this.loadGroups();
    } catch (e) {
      console.error('Erro ao aceitar convite', e);
      this.showToast(this.t.translate('error_accepting_invite'), 'danger');
    }
  }

  async declineGroupInvite(invite: any) {
    const alert = await this.alertCtrl.create({
      header: this.t.translate('decline_invite'),
      message: this.t.translate('decline_invite_confirm').replace('{{groupName}}', invite.nome),
      buttons: [
        { text: this.t.translate('cancel'), role: 'cancel' },
        {
          text: this.t.translate('decline_invite'),
          role: 'destructive',
          handler: async () => {
            await this.performDeclineInvite(invite);
          }
        }
      ]
    });
    await alert.present();
  }

  private async performDeclineInvite(invite: any) {
    try {
      const userId = this.currentUser.id_utilizador || this.currentUser.id;
      await this.httpApi.updateUserGroupStatus(invite.id_grupo, userId, 4);
      this.showToast(this.t.translate('invitation_declined'), 'success');
      this.loadPendingInvites();
    } catch (e) {
      console.error('Erro ao recusar convite', e);
      this.showToast(this.t.translate('error_declining_invite'), 'danger');
    }
  }

  goToGroup(group: any) {
    this.router.navigate(['/info-grupo', group.id_grupo || group._id]);
  }

  isGroupOwner(group: any): boolean {
    if (!this.currentUser || !group?.createdBy) return false;
    const currentUserId = this.currentUser.id_utilizador || this.currentUser.id;
    const creatorId = group.createdBy.id_utilizador || group.createdBy.id || group.createdBy;
    return Number(currentUserId) === Number(creatorId);
  }

  async deleteGroup(group: any) {
    const alert = await this.alertCtrl.create({
      header: this.t.translate('delete_group'),
      message: this.t.translate('delete_group_confirm').replace('{{groupName}}', group.nome),
      buttons: [
        { text: this.t.translate('cancel'), role: 'cancel' },
        {
          text: this.t.translate('delete_group'),
          role: 'destructive',
          handler: async () => {
            await this.performDeleteGroup(group);
          }
        }
      ]
    });
    await alert.present();
  }

  private async performDeleteGroup(group: any) {
    this.loading = true;
    try {
      await this.httpApi.updateGroupUserStatus(group.id_grupo, 4);
      this.showToast(this.t.translate('group_deleted'), 'success');
      this.loadGroups();
    } catch (e) {
      console.error('Erro ao eliminar grupo', e);
      this.showToast(this.t.translate('error_deleting_group'), 'danger');
    } finally {
      this.loading = false;
    }
  }

  async leaveGroup(group: any) {
    const alert = await this.alertCtrl.create({
      header: this.t.translate('leave_group'),
      message: this.t.translate('leave_group_confirm').replace('{{groupName}}', group.nome),
      buttons: [
        { text: this.t.translate('cancel'), role: 'cancel' },
        {
          text: this.t.translate('leave_group'),
          role: 'destructive',
          handler: async () => {
            await this.performLeaveGroup(group);
          }
        }
      ]
    });
    await alert.present();
  }

  private async performLeaveGroup(group: any) {
    this.loading = true;
    try {
      const userId = this.currentUser.id_utilizador || this.currentUser.id;
      await this.httpApi.updateUserGroupStatus(group.id_grupo, userId, 4);
      this.showToast(this.t.translate('group_left'), 'success');
      this.ionViewWillEnter();
    } catch (e) {
      console.error('Erro ao sair do grupo', e);
      this.showToast(this.t.translate('error_leaving_group'), 'danger');
    } finally {
      this.loading = false;
    }
  }

  getMemberCount(group: any): number {
    if (group.members && Array.isArray(group.members)) {
      return group.members.length;
    }
    if (group.grupo_user && Array.isArray(group.grupo_user)) {
      return group.grupo_user.filter((gu: any) => gu.status_convite === 1).length;
    }
    return 0;
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

  goToCreateGroup() {
    this.router.navigate(['/cria-grupo']);
  }
}

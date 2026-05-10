import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { ToastController, AlertController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-info-grupo',
  templateUrl: './info-grupo.page.html',
  styleUrls: ['./info-grupo.page.scss'],
  standalone: false,
})
export class InfoGrupoPage implements OnInit, OnDestroy {
  @ViewChild('tabs', { static: false }) tabs: any;
  @ViewChild('messagesList', { static: false }) messagesList: any;
  public groupId: string = '';
  public group: any = null;
  public messages: any[] = [];
  public newMessage: string = '';
  public allUsers: any[] = [];
  public filteredUsers: any[] = [];
  public memberSearchText: string = '';
  public currentUser: any = null;
  public loading = false;
  public chatLoading = false;
  public editGroupName: string = '';
  public editGroupDescription: string = '';
  public previousMessageCount: number = 0;
  private messagePollingInterval: any;
  public selectedTab: string = 'chat';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpApi: HttpApiService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    public t: TranslationService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.groupId = this.route.snapshot.params['id'];
    this.loadCurrentUser();
    this.loadGroup();
    this.loadMessages();
    this.loadAllUsers();
    this.startMessagePolling();
  }

  ngOnDestroy() {
    if (this.messagePollingInterval) {
      clearInterval(this.messagePollingInterval);
    }
  }

  private startMessagePolling() {
    this.messagePollingInterval = setInterval(() => {
      this.loadMessages(false);
    }, 3000);
  }

  onTabChange(event: any) {
    console.log('Tab changed event:', event);
    if (event?.detail?.tab) {
      this.selectedTab = event.detail.tab;
    } else if (event?.tab) {
      this.selectedTab = event.tab;
    } else if (this.tabs) {
      setTimeout(() => {
        if (this.tabs?.getSelected) {
          this.selectedTab = this.tabs.getSelected();
        }
      }, 100);
    }
    console.log('Selected tab:', this.selectedTab);
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messagesList?.el) {
        this.messagesList.el.scrollTop = this.messagesList.el.scrollHeight;
      }
    }, 100);
  }

  async loadCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
  }

  async loadGroup() {
    this.loading = true;
    try {
      const result: any = await this.httpApi.getGroupById(this.groupId);
      this.group = result?.data || result;
      this.editGroupName = this.group?.nome || '';
      this.editGroupDescription = this.group?.descr || '';
    } catch (e) {
      console.error('Erro ao carregar grupo', e);
      this.showToast(this.t.translate('error_loading_group'), 'danger');
    } finally {
      this.loading = false;
    }
  }

  async loadMessages(showLoading: boolean = true) {
    if (showLoading) {
      this.chatLoading = true;
    }
    try {
      const result: any = await this.httpApi.getChatMessages(this.groupId);
      const newMessages = Array.isArray(result) ? result : (result?.data || []);
      
      if (newMessages.length > this.previousMessageCount && this.previousMessageCount > 0) {
        const newMessageCount = newMessages.length - this.previousMessageCount;
        const recentMessages = newMessages.slice(-newMessageCount);
        
        recentMessages.forEach((msg: any) => {
          if (msg.senderId !== this.currentUser?.id_utilizador && msg.senderId !== this.currentUser?.id) {
            this.notificationService.notifyNewMessage(
              this.group?.nome || 'Group',
              msg.senderName || 'Someone',
              msg.message || ''
            );
          }
        });
      }
      
      this.messages = newMessages;
      this.previousMessageCount = newMessages.length;
      this.scrollToBottom();
    } catch (e) {
      console.error('Erro ao carregar mensagens', e);
      if (showLoading) {
        this.showToast(this.t.translate('error_sending_message'), 'danger');
      }
    } finally {
      if (showLoading) {
        this.chatLoading = false;
      }
    }
  }

  async loadAllUsers() {
    try {
      const result: any = await this.httpApi.getAllUsers();
      const allUsers = Array.isArray(result) ? result : (result?.data || []);
      this.allUsers = allUsers.filter((u: any) => !this.group?.members?.some((m: any) => m.id_utilizador === u.id_utilizador));
      this.updateFilteredUsers();
    } catch (e) {
      console.error('Erro ao carregar utilizadores', e);
    }
  }

  updateFilteredUsers() {
    if (!this.memberSearchText || !this.memberSearchText.trim()) {
      this.filteredUsers = [...this.allUsers];
    } else {
      const searchTerm = this.memberSearchText.toLowerCase();
      this.filteredUsers = this.allUsers.filter((u: any) => 
        u.nome?.toLowerCase().includes(searchTerm) || 
        u.email?.toLowerCase().includes(searchTerm)
      );
    }
  }

  async selectUserToAdd(user: any) {
    try {
      await this.httpApi.addMemberToGroup(this.groupId, user.id_utilizador);
      this.showToast(this.t.translate('member_added'), 'success');
      this.memberSearchText = '';
      this.loadGroup();
      this.loadAllUsers();
    } catch (e) {
      console.error('Erro ao adicionar membro', e);
      this.showToast(this.t.translate('error_adding_member'), 'danger');
    }
  }

  async sendMessage() {
    if (!this.newMessage.trim()) return;

    try {
      const messageData = {
        groupId: this.groupId,
        senderId: this.currentUser.id_utilizador || this.currentUser.id,
        senderName: this.currentUser.nome || this.currentUser.email,
        message: this.newMessage.trim()
      };

      await this.httpApi.saveChatMessage(messageData);
      this.newMessage = '';
      this.messages.push({
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        message: messageData.message,
        timestamp: new Date()
      });
      this.scrollToBottom();
      this.loadMessages(false);
    } catch (e) {
      console.error('Erro ao enviar mensagem', e);
      this.showToast(this.t.translate('error_sending_message'), 'danger');
    }
  }

  async addMember() {
    const availableUsers = this.allUsers
      .filter(u => !this.group.members.some((m: any) => m.id_utilizador === u.id_utilizador));

    const inputs = availableUsers.map(u => ({
      name: 'userId',
      type: 'radio' as const,
      label: u.nome || u.email,
      value: u.id_utilizador
    }));

    const alert = await this.alertCtrl.create({
      header: this.t.translate('add_member'),
      message: this.t.translate('add_member_instruction'),
      inputs,
      buttons: [
        { text: this.t.translate('cancel'), role: 'cancel' },
        {
          text: this.t.translate('add_member'),
          handler: async (data) => {
            if (data) {
              try {
                await this.httpApi.addMemberToGroup(this.groupId, data);
                this.loadGroup(); 
                this.showToast(this.t.translate('member_added'), 'success');
              } catch (e) {
                console.error('Erro ao adicionar membro', e);
                this.showToast(this.t.translate('error_adding_member'), 'danger');
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async removeMember(member: any) {
    const alert = await this.alertCtrl.create({
      header: this.t.translate('remove_member_title'),
      message: this.t.translate('remove_member_confirm').replace('{{name}}', member.nome),
      buttons: [
        { text: this.t.translate('cancel'), role: 'cancel' },
        {
          text: this.t.translate('remove_member'),
          role: 'destructive',
          handler: async () => {
            try {
              await this.httpApi.removeMemberFromGroup(this.groupId, member.id_utilizador);
              this.loadGroup(); // Reload group
              this.showToast(this.t.translate('member_removed'), 'success');
            } catch (e) {
              console.error('Erro ao remover membro', e);
              this.showToast(this.t.translate('error_removing_member'), 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  isCreator(): boolean {
    if (!this.group || !this.currentUser) {
      return false;
    }
    
    if (this.group.createdBy) {
      const creatorId = this.group.createdBy.id_utilizador || this.group.createdBy.id;
      const currentUserId = this.currentUser.id_utilizador || this.currentUser.id;
      return Number(creatorId) === Number(currentUserId);
    }
    
    if (Array.isArray(this.group.grupo_user)) {
      const currentUserId = this.currentUser.id_utilizador || this.currentUser.id;
      const userGrupoUser = this.group.grupo_user.find((gu: any) => 
        String(gu.id_user) === String(currentUserId)
      );
      return userGrupoUser?.criador === true;
    }
    
    return false;
  }

  editGroup() {
    if (this.groupId) {
      this.router.navigate(['/edita-grupo', { id: this.groupId }]);
    }
  }

  async saveGroupChanges() {
    if (!this.editGroupName?.trim()) {
      this.showToast(this.t.translate('group_name_required'), 'danger');
      return;
    }

    try {
      this.loading = true;
      const updateData = {
        nome: this.editGroupName.trim(),
        descr: this.editGroupDescription.trim()
      };

      await this.httpApi.updateGrupo(Number(this.groupId), updateData);
      this.showToast(this.t.translate('group_updated'), 'success');
      this.group.nome = this.editGroupName;
      this.group.descr = this.editGroupDescription;
    } catch (error) {
      console.error('Error updating group:', error);
      this.showToast(this.t.translate('error_updating_group'), 'danger');
    } finally {
      this.loading = false;
    }
  }

  private async showToast(message: string, color = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}

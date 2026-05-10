import { Component, OnInit } from '@angular/core';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { TranslationService } from '../../../services/translations/translation.service';
import { PopoverController } from '@ionic/angular';
import { OwnerPopoverComponent } from '../owner-popover.component';

@Component({
  selector: 'app-regista-mochila',
  templateUrl: './regista-mochila.page.html',
  styleUrls: ['./regista-mochila.page.scss'],
  standalone: false,
})
export class RegistaMochilaPage implements OnInit {
  public users: any[] = [];
  public peregrinoUsers: any[] = [];
  public filteredUsers: any[] = [];
  public selectedOwner: any = null;
  public selectedOwnerId: any = null;
  public weight: number | null = null;
  public color: string = '';
  public searching: string = '';
  public loading = false;

  constructor(private httpApi: HttpApiService, public t: TranslationService, private popoverCtrl: PopoverController) { }

  async openOwnerPopover(ev?: any) {
    const pop = await this.popoverCtrl.create({
      component: OwnerPopoverComponent,
      componentProps: { users: this.peregrinoUsers },
      event: ev,
      translucent: true,
      cssClass: 'owner-popover'
    });
    await pop.present();
    const { data } = await pop.onDidDismiss();
    if (data && data.selected) {
      this.selectOwner(data.selected);
    }
  }

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    try {
      const peregrinoTipo = 5; 

      const users = await this.httpApi.getUsersByTipo(peregrinoTipo);
      this.peregrinoUsers = Array.isArray(users) ? users : [];
      this.filteredUsers = [...this.peregrinoUsers];
    } catch (err) {
      console.error('Error loading users', err);
      this.peregrinoUsers = [];
      this.filteredUsers = [];
    } finally {
      this.loading = false;
    }
  }

  onSearch(e: any) {
    const q = (e.detail?.value || '').toLowerCase().trim();
    this.searching = q;
    if (!q) this.filteredUsers = [...this.peregrinoUsers];
    else this.filteredUsers = this.peregrinoUsers.filter(u => (u.email || '').toLowerCase().includes(q) || (u.nome || '').toLowerCase().includes(q));
  }

  selectOwner(user: any) {
    this.selectedOwner = user;
    this.selectedOwnerId = user?.id_utilizador ?? null;
  }

  async submit() {
    // Assegura que o proprietário está selecionado
    if (!this.selectedOwner) {
      if (this.selectedOwnerId) {
        this.selectedOwner = this.peregrinoUsers.find(u => u.id_utilizador === this.selectedOwnerId) || null;
      }
    }

    if (!this.selectedOwner) {
      alert(this.t.translate('select_owner_required'));
      return;
    }
    if (!this.weight || this.weight <= 0) {
      alert(this.t.translate('weight_required'));
      return;
    }

    const rec: any = {
      id_user: this.selectedOwner.id_utilizador,
      cor: this.color,
      peso: this.weight
      
    };

    try {
      await this.httpApi.createMochila(rec);
      alert(this.t.translate('backpack_created'));
      // reset
      this.selectedOwner = null;
      this.weight = null;
      this.color = '';
      this.filteredUsers = [...this.peregrinoUsers];
    } catch (err) {
      console.error('Error creating mochila', err);
      alert(this.t.translate('save_error'));
    }
  }

}

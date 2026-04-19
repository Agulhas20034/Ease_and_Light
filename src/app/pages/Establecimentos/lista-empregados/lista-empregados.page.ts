import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpApiService } from 'src/app/services/http-api/http-api.service';
import { TranslationService } from 'src/app/services/translations/translation.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-lista-empregados',
  templateUrl: './lista-empregados.page.html',
  styleUrls: ['./lista-empregados.page.scss'],
  standalone: false,
})
export class ListaEmpregadosPage implements OnInit {
  users: any[] = [];
  loading = false;
  estabId: number | null = null;

  constructor(
    private httpApi: HttpApiService,
    private router: Router,
    private route: ActivatedRoute,
    public t: TranslationService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    // Lê query param 'id' para filtrar pelos empregados de um estabelecimento específico
    this.route.queryParams.subscribe((p) => {
      if (p && p['id']) {
        this.estabId = Number(p['id']);
      } else {
        this.estabId = null;
      }
      console.log('lista-empregados ngOnInit: estabId =', this.estabId);
      this.loadUsers();
    });
  }

  // Carrega os empregados: se estivermos numa página específica de estabelecimento,
  // carrega apenas os ligados a esse estabelecimento, senão carrega todos do tipo 6.
  async loadUsers() {
    this.loading = true;
    try {
      if (this.estabId) {
        console.log('Loading employees for estabelecimento:', this.estabId);
        const res: any = await this.httpApi.getUsersByEstabelecimento(this.estabId);
        this.users = Array.isArray(res) ? res.map((u: any) => ({ ...u, estado: Number(u.estado) })) : [];
        console.log('Loaded employees:', this.users.length);
      } else {
        console.log('No estabId, loading all type 6 users (should not happen)');
        const all = await this.httpApi.getUsersByTipo(6);
        this.users = (all || []).map((u: any) => ({ ...u, estado: Number(u.estado) }));
      }
    } catch (err) {
      console.error('Erro ao carregar empregados', err);
    } finally {
      this.loading = false;
    }
  }

  // Navega para edição do funcionário
  editUser(user: any) {
    this.router.navigate(['/edita-empregado'], { queryParams: { id: user.id_utilizador } });
  }

  // Alterna estado do funcionário (ativo/desativado)
  async toggleUser(user: any) {
    const confirm = await this.alertCtrl.create({
      header: this.t.translate('confirm'),
      message: this.t.translate('confirm_toggle_employee'),
      buttons: [
        { text: this.t.translate('cancel'), role: 'cancel' },
        {
          text: this.t.translate('ok'),
          handler: async () => {
            const currentEstado = Number(user.estado) || 1;
            const newEstado = currentEstado === 1 ? 2 : 1;
            try {
              await this.httpApi.updateUser(user.id_utilizador, { estado: newEstado });
              user.estado = newEstado;
              const toast = await this.toastCtrl.create({ message: this.t.translate('employee_updated'), duration: 1500 });
              toast.present();
            } catch (err) {
              console.error('Erro ao actualizar user', err);
            }
          },
        },
      ],
    });
    await confirm.present();
  }

  // Navega para cria-empregado, passando o estabelecimento atual (se houver)
  createUser() {
    const params: any = {};
    if (this.estabId) params.id = this.estabId;
    this.router.navigate(['/cria-empregado'], { queryParams: params });
  }
}

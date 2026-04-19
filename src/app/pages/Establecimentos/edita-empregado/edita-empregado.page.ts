import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpApiService } from 'src/app/services/http-api/http-api.service';
import { TranslationService } from 'src/app/services/translations/translation.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-edita-empregado',
  templateUrl: './edita-empregado.page.html',
  styleUrls: ['./edita-empregado.page.scss'],
  standalone: false,
})
export class EditaEmpregadoPage implements OnInit {
  userId: number | null = null;
  loading = false;
  nome = '';
  email = '';
  telefone = '';
  nif = '';
  passaporte = '';
  estado: number = 1;

  constructor(
    private act: ActivatedRoute,
    private httpApi: HttpApiService,
    private router: Router,
    private toastCtrl: ToastController,
    public t: TranslationService
  ) {}

  ngOnInit() {
    // Ler query param id do funcionário a editar
    this.act.queryParams.subscribe((p) => {
      if (p && p['id']) this.userId = Number(p['id']);
      if (this.userId) this.loadUser();
    });
  }

  // Carrega os dados do utilizador para popular o formulário
  async loadUser() {
    if (!this.userId) return;
    this.loading = true;
    try {
      const u: any = await this.httpApi.getUser(this.userId);
      if (u) {
        this.nome = u.nome || '';
        this.email = u.email || '';
        this.telefone = u.telefone || '';
        this.nif = u.nif || '';
        this.passaporte = u.passaporte || '';
        this.estado = Number(u.estado) || 1;
        console.log('Loaded user:', { userId: this.userId, estado: this.estado, nome: this.nome });
      }
    } catch (e) {
      console.error('Erro ao carregar utilizador', e);
    } finally {
      this.loading = false;
    }
  }

  isTelefoneValid(): boolean {
    const cleaned = (this.telefone || '').replace(/\D/g, '');
    return cleaned.length >= 9;
  }

  isNifValid(): boolean {
    const cleaned = (this.nif || '').replace(/\D/g, '');
    return cleaned.length === 9;
  }

  tKey(k: string) { return this.t.translate(k); }

  // Guarda alterações do empregado
  async save() {
    if (!this.userId) return;
    if (this.telefone && !this.isTelefoneValid()) {
      const toast = await this.toastCtrl.create({ message: this.tKey('phone_invalid'), duration: 2000, color: 'warning' });
      toast.present();
      return;
    }
    if (this.nif && !this.isNifValid()) {
      const toast = await this.toastCtrl.create({ message: this.tKey('nif_invalid'), duration: 2000, color: 'warning' });
      toast.present();
      return;
    }

    this.loading = true;
    try {
      // Verifica se o NIF já existe em outro utilizador (permitir manter o mesmo NIF do próprio utilizador)
      if (this.nif) {
        const taken = await this.httpApi.isNifTakenByOther(this.nif, this.userId);
        if (taken) {
          const toast = await this.toastCtrl.create({ message: this.tKey('nif_in_use'), duration: 2000, color: 'warning' });
          toast.present();
          this.loading = false;
          return;
        }
      }
      const updateData = {
        nome: this.nome || null,
        telefone: this.telefone || null,
        nif: this.nif || null,
        passaporte: this.passaporte || null,
        estado: Number(this.estado) || 1
      };
      console.log('Updating user:', { userId: this.userId, updateData });
      await this.httpApi.updateUser(this.userId, updateData);
      const toast = await this.toastCtrl.create({ message: this.tKey('edit_saved'), duration: 1500, color: 'success' });
      toast.present();
      setTimeout(() => this.router.navigate(['/lista-empregados'], { queryParams: { id: null } }), 600);
    } catch (e: any) {
      console.error('Erro ao guardar empregado', e);
      const toast = await this.toastCtrl.create({ message: e?.message || this.tKey('save_error'), duration: 2000, color: 'danger' });
      toast.present();
    } finally {
      this.loading = false;
    }
  }
}

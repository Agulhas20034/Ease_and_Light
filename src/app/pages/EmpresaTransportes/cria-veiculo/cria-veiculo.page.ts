import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { ToastController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-cria-veiculo',
  templateUrl: './cria-veiculo.page.html',
  styleUrls: ['./cria-veiculo.page.scss'],
  standalone: false,
})
export class CriaVeiculoPage implements OnInit {
  matricula = '';
  vin_veiculo = '';
  id_tipo: any = null;
  id_empresa: number | null = null;
  marca = '';
  modelo = '';
  cor = '';
  tipos: any[] = [];
  loading = false;

  constructor(
    private act: ActivatedRoute,
    private httpApi: HttpApiService,
    private toastCtrl: ToastController,
    private router: Router,
    public t: TranslationService
  ) {}

  ngOnInit() {
    this.act.queryParams.subscribe(params => {
      const id = params['id'] || params['id_empresa'] || params['companyId'];
      if (id) this.id_empresa = Number(id);
    });
    this.loadTipoVeiculos();
  }

  /** Se não houver `id_empresa` nos query params, tentar inferir a partir do utilizador logado */
  private async inferEmpresaFromUserIfMissing() {
    if (this.id_empresa) return;
    try {
      const raw = localStorage.getItem('currentUser');
      const user = raw ? JSON.parse(raw) : null;
      if (!user || !user.id_utilizador) return;
      const rels: any = await this.httpApi.getUserEmpresas(Number(user.id_utilizador));
      const rows = Array.isArray(rels) ? rels : (rels?.data || []);
      if (rows && rows.length > 0) {
        const first = rows[0];
        const empresaId = first.id_empresa || first['id_empresa'] || first.id || first['id_empresa_transportes'];
        if (empresaId) {
          this.id_empresa = Number(empresaId);
          console.log('cria-veiculo: inferred id_empresa from user relations', this.id_empresa);
        }
      }
    } catch (e) {
      console.warn('Failed to infer empresa for user', e);
    }
  }

  /** Carregar opções de tipo de veículo da tabela `tipo_veiculo` */
  private async loadTipoVeiculos() {
    try {
      const data: any = await this.httpApi.getAllTipoVeiculo();
      const rows = Array.isArray(data) ? data : (data?.data || []);
      // Normalizar um campo de exibição para o template; preferir `descr` quando existir
      this.tipos = rows.map((tp: any) => ({
        ...(tp || {}),
        displayName: tp.descr || tp.descricao || tp.nome || tp.nome_tipo || tp.tipo || tp.name || tp.tipo_veiculo || (`Tipo ${tp.id_tipo}`)
      }));
    } catch (e) {
      console.warn('Failed to load tipo_veiculo', e);
    }
  }

  /** Valida e cria o veículo na base de dados */
  async save() {
    this.loading = true;
    try {
      // garantir que temos id_empresa (tentar inferir a partir do user se estiver ausente)
      await this.inferEmpresaFromUserIfMissing();
      // validações
      const matRegex = /^[A-Za-z0-9]{2}-[A-Za-z0-9]{2}-[A-Za-z0-9]{2}$/;
      if (!matRegex.test((this.matricula || '').trim())) {
        const toast = await this.toastCtrl.create({ message: this.t.translate('provide_all_fields') + ' (' + this.t.translate('invalid_registration') + ')', duration: 2200, color: 'warning' });
        toast.present();
        this.loading = false;
        return;
      }
      if (!/^[A-Za-z0-9]{17}$/.test((this.vin_veiculo || '').trim())) {
        const toast = await this.toastCtrl.create({ message: this.t.translate('provide_all_fields') + ' (' + this.t.translate('invalid_vin') + ')', duration: 2200, color: 'warning' });
        toast.present();
        this.loading = false;
        return;
      }
      if (!this.id_tipo) {
        const toast = await this.toastCtrl.create({ message: this.t.translate('provide_all_fields') + ' (' + this.t.translate('missing_type') + ')', duration: 2200, color: 'warning' });
        toast.present();
        this.loading = false;
        return;
      }
      if (!this.id_empresa) {
        const toast = await this.toastCtrl.create({ message: this.t.translate('provide_all_fields') + ' (' + this.t.translate('missing_company') + ')', duration: 2200, color: 'warning' });
        toast.present();
        this.loading = false;
        return;
      }

      const rec: any = {
        matricula: this.matricula.trim(),
        vin_veiculo: this.vin_veiculo.trim(),
        id_tipo: this.id_tipo,
        id_empresa: this.id_empresa,
        marca: this.marca.trim() || null,
        modelo: this.modelo.trim() || null,
        cor: this.cor.trim() || null,
        estado: 1
      };
      // Verifica unicidade de matrícula e VIN
      try {
        const existingMat = await this.httpApi.getVeiculo(rec.matricula);
        if (existingMat) {
          const toast = await this.toastCtrl.create({ message: this.t.translate('registration_taken'), duration: 2200, color: 'warning' });
          toast.present();
          this.loading = false;
          return;
        }
      } catch (err) {
        console.warn('Failed to check existing matricula', err);
      }

      try {
        const { data: vinRow, error: vinErr } = await this.httpApi.checkVehicleVinUniqueness('veiculos', rec.vin_veiculo);
        if (vinErr) throw vinErr;
        if (vinRow) {
          const toast = await this.toastCtrl.create({ message: this.t.translate('vin_taken'), duration: 2200, color: 'warning' });
          toast.present();
          this.loading = false;
          return;
        }
      } catch (err) {
        console.warn('Failed to check existing VIN', err);
      }

      await this.httpApi.createVeiculo(rec);
      const toast = await this.toastCtrl.create({ message: this.t.translate('vehicle_created') || 'Veículo criado', duration: 1600, color: 'success' });
      toast.present();
      this.router.navigate(['/gere-veiculos'], { queryParams: { id: this.id_empresa } });
    } catch (e) {
      console.error('Failed to create vehicle', e);
      const toast = await this.toastCtrl.create({ message: this.t.translate('save_error'), duration: 2000, color: 'danger' });
      toast.present();
    } finally {
      this.loading = false;
    }
  }

}

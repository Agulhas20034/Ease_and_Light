import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase/supabase';
import { ToastController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-edita-veiculo',
  templateUrl: './edita-veiculo.page.html',
  styleUrls: ['./edita-veiculo.page.scss'],
  standalone: false,
})
export class EditaVeiculoPage implements OnInit {
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
    private supabase: SupabaseService,
    private toastCtrl: ToastController,
    private router: Router,
    public t: TranslationService
  ) {}

  ngOnInit() {
    this.act.queryParams.subscribe(params => {
      const m = params['matricula'] || params['mat'] || params['id'];
      if (m) this.loadVehicle(String(m));
    });
    this.loadTipoVeiculos();
  }

  private async loadTipoVeiculos() {
    try {
      const data: any = await this.supabase.getAllTipoVeiculo();
      const rows = Array.isArray(data) ? data : (data?.data || []);
      this.tipos = rows.map((tp: any) => ({ ...(tp||{}), displayName: tp.descr || tp.descricao || tp.nome || tp.nome_tipo || tp.tipo || tp.name || tp.tipo_veiculo || (`Tipo ${tp.id_tipo}`) }));
    } catch (e) {
      console.warn('Failed to load tipo_veiculo', e);
    }
  }

  private async loadVehicle(matricula: string) {
    try {
      const data: any = await this.supabase.getVeiculo(matricula);
      const v = data || (data?.data && data.data[0]) || {};
      this.matricula = v.matricula || v['matricula'] || '';
      this.vin_veiculo = v.vin_veiculo || v['vin_veiculo'] || '';
      this.id_tipo = v.id_tipo || v['id_tipo'] || null;
      this.id_empresa = v.id_empresa || v['id_empresa'] || null;
      this.marca = v.marca || v['marca'] || '';
      this.modelo = v.modelo || v['modelo'] || '';
      this.cor = v.cor || v['cor'] || '';
    } catch (e) {
      console.error('Failed to load vehicle', e);
    }
  }

  async save() {
    if (!this.matricula) return;
    this.loading = true;
    try {
      // validations similar to create
      const matRegex = /^[A-Za-z0-9]{2}-[A-Za-z0-9]{2}-[A-Za-z0-9]{2}$/;
      if (!matRegex.test((this.matricula || '').trim())) {
        const toast = await this.toastCtrl.create({ message: this.t.translate('provide_all_fields') + ' (' + this.t.translate('invalid_registration') + ')', duration: 2200, color: 'warning' });
        toast.present(); this.loading = false; return;
      }
      if (!/^[A-Za-z0-9]{17}$/.test((this.vin_veiculo || '').trim())) {
        const toast = await this.toastCtrl.create({ message: this.t.translate('provide_all_fields') + ' (' + this.t.translate('invalid_vin') + ')', duration: 2200, color: 'warning' });
        toast.present(); this.loading = false; return;
      }
      //garante que vin é unico(mas permite manter o mesmo vin do veiculo que se esta a editar)
      try {
        const vinTrim = (this.vin_veiculo || '').trim();
        if (vinTrim) {
          const { data: existingVin, error: vinErr } = await this.supabase.client.from('veiculos').select('matricula').eq('vin_veiculo', vinTrim).maybeSingle();
          if (vinErr) throw vinErr;
          if (existingVin && String(existingVin.matricula || existingVin['matricula']) !== String(this.matricula)) {
            const toast = await this.toastCtrl.create({ message: this.t.translate('vin_taken'), duration: 2200, color: 'warning' });
            toast.present(); this.loading = false; return;
          }
        }
      } catch (e) {
        console.warn('VIN uniqueness check failed', e);
      }
      const updates: any = {
        vin_veiculo: this.vin_veiculo.trim(),
        id_tipo: this.id_tipo,
        id_empresa: this.id_empresa,
        marca: this.marca.trim() || null,
        modelo: this.modelo.trim() || null,
        cor: this.cor.trim() || null
      };
      await this.supabase.updateVeiculo(this.matricula, updates);
      const toast = await this.toastCtrl.create({ message: this.t.translate('edit_saved') || 'Alterações guardadas', duration: 1500, color: 'success' });
      toast.present();
      this.router.navigate(['/gere-veiculos'], { queryParams: { id: this.id_empresa } });
    } catch (e) {
      console.error('Failed to save vehicle', e);
      const toast = await this.toastCtrl.create({ message: this.t.translate('save_error'), duration: 2000, color: 'danger' });
      toast.present();
    } finally {
      this.loading = false;
    }
  }

}

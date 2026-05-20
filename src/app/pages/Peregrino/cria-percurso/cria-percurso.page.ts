import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-cria-percurso',
  templateUrl: './cria-percurso.page.html',
  styleUrls: ['./cria-percurso.page.scss'],
  standalone: false,
})
export class CriaPercursoPage implements OnInit {
  percursoForm!: FormGroup;
  estabelecimentos: any[] = [];
  dificuldades: any[] = [];
  selectedEtapas: any[] = [];
  etapasMap: Map<number, boolean> = new Map();
  selectedEstabelecimentoId: number | null = null;
  isSubmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private httpApi: HttpApiService,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private tService: TranslationService
  ) {}

  t(key: string): string {
    return this.tService.translate(key);
  }

  ngOnInit() {
    this.initializeForm();
    this.loadDificuldades();
    this.loadEstabelecimentos();
  }

  initializeForm() {
    this.percursoForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      descr: ['', [Validators.required, Validators.minLength(5)]],
      id_dificuldade: ['', Validators.required]
    });
  }

  async loadEstabelecimentos() {
    try {
      const data = await this.httpApi.getAllEstabelecimento();
      this.estabelecimentos = data || [];
    } catch (error) {
      console.error('Error loading estabelecimentos:', error);
      this.showToast(this.t('error_loading_locations'), 'danger');
    }
  }

  async loadDificuldades() {
    try {
      const data = await this.httpApi.getAllDificuldadePercurso();
      this.dificuldades = data || [];
    } catch (error) {
      console.error('Error loading dificuldades:', error);
      this.showToast(this.t('error_loading_difficulties'), 'danger');
    }
  }

  get availableEstabelecimentos(): any[] {
    return this.estabelecimentos.filter(
      est => !this.etapasMap.has(est.id_estabelecimento)
    );
  }

  addEtapa(estabelecimentoId: number | null) {
    if (!estabelecimentoId) {
      return;
    }

    const estabelecimento = this.estabelecimentos.find(
      est => est.id_estabelecimento === estabelecimentoId
    );
    if (!estabelecimento) {
      return;
    }

    if (!this.etapasMap.get(estabelecimentoId)) {
      this.etapasMap.set(estabelecimentoId, true);
      this.selectedEtapas.push({ ...estabelecimento });
    }

    this.selectedEstabelecimentoId = null;
  }

  removeEtapa(estabelecimentoId: number) {
    this.etapasMap.delete(estabelecimentoId);
    this.selectedEtapas = this.selectedEtapas.filter(
      e => e.id_estabelecimento !== estabelecimentoId
    );
  }

  async submitForm() {
    if (!this.percursoForm.valid) {
      this.showToast(this.t('fill_required_fields'), 'warning');
      return;
    }

    if (this.selectedEtapas.length === 0) {
      this.showToast(this.t('select_at_least_one_location'), 'warning');
      return;
    }

    this.isSubmitting = true;

    try {
      const nomeValue = String(this.percursoForm.get('nome')?.value || '').trim();
      const descrValue = String(this.percursoForm.get('descr')?.value || '').trim();
      const percursoData = {
        nome: nomeValue,
        descr: descrValue,
        id_dificuldade: this.percursoForm.get('id_dificuldade')?.value
      };

      console.log('cria-percurso payload', percursoData);

      const percursoResult = await this.httpApi.createPercurso(percursoData);
      
      if (!percursoResult || !percursoResult[0]?.id_percurso) {
        throw new Error('Failed to create percurso');
      }

      const percursoId = percursoResult[0].id_percurso;

      for (const estabelecimento of this.selectedEtapas) {
        const etapaData = {
          id_estabelecimento: estabelecimento.id_estabelecimento
        };
        
        const etapaResult = await this.httpApi.createEtapa(etapaData);
        
        if (!etapaResult || !etapaResult[0]?.id_etapa) {
          console.warn('Failed to create etapa for estabelecimento:', estabelecimento.id_estabelecimento);
          continue;
        }

        const etapaId = etapaResult[0].id_etapa;

        const etapasPercursoData = {
          id_percurso: percursoId,
          id_etapa: etapaId
        };
        
        await this.httpApi.create('etapas-percurso', etapasPercursoData);
      }

      this.showToast(this.t('route_created_success'), 'success');
      
      setTimeout(() => {
        this.router.navigate(['/gere-grupo']);
      }, 1500);
      
    } catch (error) {
      console.error('Error creating percurso:', error);
      this.showToast(this.t('error_creating_route'), 'danger');
    } finally {
      this.isSubmitting = false;
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  async clearForm() {
    const alert = await this.alertController.create({
      header: this.t('clear'),
      message: this.t('clear_form_confirm'),
      buttons: [
        {
          text: this.t('cancel'),
          role: 'cancel'
        },
        {
          text: this.t('clear'),
          handler: () => {
            this.percursoForm.reset();
            this.selectedEtapas = [];
            this.etapasMap.clear();
          }
        }
      ]
    });
    await alert.present();
  }
}

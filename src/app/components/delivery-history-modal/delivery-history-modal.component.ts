import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { HttpApiService } from '../../services/http-api/http-api.service';
import { TranslationService } from '../../services/translations/translation.service';
import { ReviewModalComponent } from '../review-modal/review-modal.component';

@Component({
  selector: 'app-delivery-history-modal',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './delivery-history-modal.component.html',
  styleUrls: ['./delivery-history-modal.component.scss']
})
export class DeliveryHistoryModalComponent implements OnInit {
  @Input() company: any;
  @Input() userId?: number;

  deliveries: any[] = [];
  loading = false;
  estabelecimentos: Record<string, any> = {};
  empresas: Record<string, any> = {};
  estadoDescrCache: Record<number, string> = {};

  constructor(
    private modalCtrl: ModalController,
    private httpApi: HttpApiService,
    public t: TranslationService
  ) {}

  ngOnInit() {
    this.loadDeliveryHistory();
  }

  async loadDeliveryHistory() {
    this.loading = true;
    try {
      const allDeliveries: any = await this.httpApi.getAllEntregasRecolhas();
      const deliveriesArray = Array.isArray(allDeliveries) ? allDeliveries : (allDeliveries?.data || []);

      if (this.company) {
        const companyId = this.company.id_empresa || this.company.id;
        this.deliveries = deliveriesArray
          .filter((d: any) => Number(d.id_empresa) === Number(companyId))
          .sort((a: any, b: any) => {
            const dateA = new Date(a.data_hora_recolha || 0).getTime();
            const dateB = new Date(b.data_hora_recolha || 0).getTime();
            return dateB - dateA;
          });
      } else if (this.userId) {
        const allBackpacks: any = await this.httpApi.getAllMochilas();
        const backpacks = Array.isArray(allBackpacks) ? allBackpacks : (allBackpacks?.data || []);
        const userBackpackIds = new Set(
          backpacks
            .filter((m: any) => String(m.id_user ?? m.id_utilizador ?? m.id) === String(this.userId))
            .map((m: any) => String(m.id_mochila ?? m.id))
        );

        this.deliveries = deliveriesArray
          .filter((d: any) => userBackpackIds.has(String(d.id_mochila ?? d.mochila_id ?? d.id_mochila_fk ?? d.id_mochila_id ?? d.id)))
          .sort((a: any, b: any) => {
            const dateA = new Date(a.data_hora_recolha || 0).getTime();
            const dateB = new Date(b.data_hora_recolha || 0).getTime();
            return dateB - dateA;
          });
      } else {
        this.deliveries = [];
      }

      const allEstabelecimentos: any = await this.httpApi.getAllEstabelecimento();
      const estArray = Array.isArray(allEstabelecimentos) ? allEstabelecimentos : (allEstabelecimentos?.data || []);
      for (const est of estArray) {
        this.estabelecimentos[String(est.id_estabelecimento || est.id)] = est;
      }

      const allEmpresas: any = await this.httpApi.getAllEmpresaTransportes();
      const empresaArray = Array.isArray(allEmpresas) ? allEmpresas : (allEmpresas?.data || []);
      for (const empresa of empresaArray) {
        this.empresas[String(empresa.id_empresa || empresa.id)] = empresa;
      }

      await this.loadEstadoDescriptions(this.deliveries);
    } catch (e) {
      console.error('Failed to load delivery history', e);
    } finally {
      this.loading = false;
    }
  }

  private async loadEstadoDescriptions(deliveries: any[]) {
    const estadoIds = new Set<number>();
    for (const delivery of deliveries) {
      const id = Number(delivery.id_estado_entrega_recolha ?? delivery.id_estado ?? delivery.estado ?? delivery.status ?? 0);
      if (id) {
        estadoIds.add(id);
      }
    }

    for (const id of Array.from(estadoIds)) {
      if (this.estadoDescrCache[id]) {
        continue;
      }

      try {
        const record: any = await this.httpApi.getEstadoEntregaRecolha(id);
        this.estadoDescrCache[id] = record?.descr ?? record?.descricao ?? record?.description ?? record?.estado ?? record?.nome ?? record?.name ?? `Estado ${id}`;
      } catch (err) {
        console.warn(`Failed to load estado_entrega_recolha ${id}`, err);
        this.estadoDescrCache[id] = `Estado ${id}`;
      }
    }

    for (const delivery of deliveries) {
      const id = Number(delivery.id_estado_entrega_recolha ?? delivery.id_estado ?? delivery.estado ?? delivery.status ?? 0);
      if (id) {
        delivery.estadoDescr = this.estadoDescrCache[id];
      }
    }
  }

  getEmpresaName(id: string | number): string {
    const empresa = this.empresas[String(id)];
    return empresa ? (empresa.nome || empresa.name || String(id)) : String(id);
  }

  getEstabelecimentoName(id: string | number): string {
    const est = this.estabelecimentos[String(id)];
    return est ? (est.nome || est.name || String(id)) : String(id);
  }

  isFinished(delivery: any): boolean {
    const estadoId = Number(delivery.id_estado_entrega_recolha ?? delivery.id_estado ?? delivery.estado ?? delivery.status ?? 0);
    const status = String(delivery.status || delivery.estado || '').toLowerCase();
    return estadoId === 4 || status === 'completed' || status === 'concluida' || status === 'entregue';
  }

  async openCompanyReview(delivery: any) {
    const companyId = String(delivery.id_empresa ?? delivery.id_empresa_fk ?? delivery.id_empresa_id ?? delivery.id ?? '');
    if (!companyId) {
      return;
    }
    const modal = await this.modalCtrl.create({
      component: ReviewModalComponent,
      componentProps: {
        reviewType: 'company',
        companyId,
        companyName: this.getEmpresaName(companyId)
      }
    });
    await modal.present();
  }

  getStatusLabel(delivery: any): string {
    if (delivery.estadoDescr) {
      return delivery.estadoDescr;
    }

    const status = String(delivery.status || delivery.estado || '');
    if (status === 'completed' || status === 'entregue') {
      return this.t.translate('completed') || 'Completed';
    } else if (status === 'in_progress' || status === 'em_progresso') {
      return this.t.translate('in_progress') || 'In Progress';
    } else if (status === 'pending' || status === 'pendente') {
      return this.t.translate('pending') || 'Pending';
    }

    const estadoId = Number(delivery.id_estado_entrega_recolha ?? delivery.id_estado ?? delivery.estado ?? delivery.status ?? 0);
    return estadoId ? `Estado ${estadoId}` : status || this.t.translate('unknown') || 'Unknown';
  }

  getStatusColor(delivery: any): string {
    const estadoId = Number(delivery.id_estado_entrega_recolha ?? delivery.id_estado ?? delivery.estado ?? delivery.status ?? 0);
    if (estadoId === 4) {
      return 'success';
    } else if (estadoId === 3) {
      return 'warning';
    } else if (estadoId === 2) {
      return 'primary';
    } else if (estadoId === 1) {
      return 'tertiary';
    }

    const status = String(delivery.status || delivery.estado || '');
    if (status === 'completed' || status === 'entregue') {
      return 'success';
    } else if (status === 'in_progress' || status === 'em_progresso') {
      return 'warning';
    } else if (status === 'pending' || status === 'pendente') {
      return 'tertiary';
    }
    return 'medium';
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-PT', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
             date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(dateString);
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}

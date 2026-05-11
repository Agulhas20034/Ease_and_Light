import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { HttpApiService } from '../../services/http-api/http-api.service';
import { TranslationService } from '../../services/translations/translation.service';

@Component({
  selector: 'app-start-route-modal',
  templateUrl: './start-route-modal.component.html',
  styleUrls: ['./start-route-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class StartRouteModalComponent implements OnInit {
  @Input() group: any;
  availableRoutes: any[] = [];
  loading = false;

  constructor(
    private modalCtrl: ModalController,
    private httpApi: HttpApiService,
    public t: TranslationService
  ) {}

  async ngOnInit() {
    await this.loadAvailableRoutes();
  }

  async loadAvailableRoutes() {
    this.loading = true;
    try {
      const routes = await this.httpApi.getAllPercurso();
      this.availableRoutes = Array.isArray(routes) ? routes : [];
    } catch (error) {
      console.error('Error loading routes:', error);
      this.availableRoutes = [];
    } finally {
      this.loading = false;
    }
  }

  selectRoute(route: any) {
    this.modalCtrl.dismiss(route);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  getDifficultyName(route: any): string {
    return route.dificuldade?.nome || 'Unknown';
  }
}

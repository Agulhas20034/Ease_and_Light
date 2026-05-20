import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpApiService } from '../../services/http-api/http-api.service';
import { TranslationService } from '../../services/translations/translation.service';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss']
})
export class ReviewListComponent implements OnInit {
  @Input() location: any;
  @Input() locationId: string | null = null;
  reviews: any[] = [];
  avg: number | null = null;
  loading = false;
  expandedPhotos: Record<string, boolean> = {};

  constructor(private httpApi: HttpApiService, private modalCtrl: ModalController, private t: TranslationService) {}

  tkey(k: string) { return this.t.translate(k); }

  getLocationId(location: any): string {
    if (this.locationId) {
      return String(this.locationId);
    }
    return String(location?.id_estabelecimento || location?.id || location?.id_localizacao || location?.id_estabelecimento_supabase || '');
  }

  async ngOnInit() {
    await this.loadReviews();
  }

  async loadReviews() {
    this.loading = true;
    try {
      const locationId = this.getLocationId(this.location);
      console.log('ReviewListComponent.loadReviews locationId=', locationId, 'location=', this.location);
      if (!locationId) {
        console.warn('Reviews list opened with empty locationId', this.location);
        this.reviews = [];
        this.avg = null;
        return;
      }
      const r: any = await this.httpApi.getReviewsByLocation(locationId);
      this.reviews = Array.isArray(r) ? r : (r?.data || []);
      if (this.reviews.length) {
        this.avg = Math.round((this.reviews.reduce((s, x) => s + (x.rating || 0), 0) / this.reviews.length) * 10) / 10;
      } else {
        this.avg = null;
      }
    } catch (e) {
      console.warn('Failed to load reviews', e);
      this.reviews = [];
      this.avg = null;
    } finally {
      this.loading = false;
    }
  }

  togglePhotoSize(reviewIndex: number, photoIndex: number) {
    const key = `${reviewIndex}-${photoIndex}`;
    this.expandedPhotos[key] = !this.expandedPhotos[key];
  }

  isPhotoExpanded(reviewIndex: number, photoIndex: number) {
    return !!this.expandedPhotos[`${reviewIndex}-${photoIndex}`];
  }

  close() { this.modalCtrl.dismiss(); }
}

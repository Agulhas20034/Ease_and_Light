import { Component, OnInit } from '@angular/core';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-delivery-company-reviews',
  templateUrl: './delivery-company-reviews.page.html',
  styleUrls: ['./delivery-company-reviews.page.scss'],
  standalone: false,
})
export class DeliveryCompanyReviewsPage implements OnInit {
  public reviews: any[] = [];
  public loading = false;
  public avg: number | null = null;
  public empresas: Record<string, any> = {};

  constructor(private httpApi: HttpApiService, public t: TranslationService) {}

  async ngOnInit() {
    await this.loadReviews();
  }

  async ionViewWillEnter() {
    await this.loadReviews();
  }

  async loadReviews() {
    this.loading = true;
    try {
      const [allReviews, allEmpresas] = await Promise.all([
        this.httpApi.getAllReviews(),
        this.httpApi.getAllEmpresaTransportes()
      ]);

      const empresasArray = Array.isArray(allEmpresas) ? allEmpresas : (allEmpresas?.data || []);
      this.empresas = {};
      for (const empresa of empresasArray) {
        this.empresas[String(empresa.id_empresa || empresa.id)] = empresa;
      }

      const reviewsArray = Array.isArray(allReviews) ? allReviews : (allReviews?.data || []);
      this.reviews = reviewsArray
        .filter((r: any) => String(r.reviewType || '').toLowerCase() === 'company' || String(r.locationId || '').startsWith('company-'))
        .map((review: any) => {
          const companyId = this.getCompanyId(review.locationId);
          return {
            ...review,
            companyId,
            companyName: this.getCompanyName(companyId)
          };
        });

      if (this.reviews.length) {
        this.avg = Math.round((this.reviews.reduce((sum, rev) => sum + (Number(rev.rating) || 0), 0) / this.reviews.length) * 10) / 10;
      } else {
        this.avg = null;
      }
    } catch (error) {
      console.warn('Failed to load delivery company reviews', error);
      this.reviews = [];
      this.avg = null;
    } finally {
      this.loading = false;
    }
  }

  getCompanyId(locationId: any): string {
    const value = String(locationId || '');
    return value.startsWith('company-') ? value.replace(/^company-/, '') : value;
  }

  getCompanyName(companyId: string): string {
    const empresa = this.empresas[String(companyId)];
    return empresa ? (empresa.nome || empresa.name || `#${companyId}`) : `#${companyId}`;
  }

  tkey(key: string) {
    return this.t.translate(key);
  }

  togglePhoto(review: any, idx: number) {
    review.expandedPhotos = review.expandedPhotos || {};
    review.expandedPhotos[idx] = !review.expandedPhotos[idx];
  }

  isPhotoExpanded(review: any, idx: number) {
    return !!review.expandedPhotos?.[idx];
  }

  trackByReview(index: number, review: any) {
    return review._id || review.id || index;
  }
}

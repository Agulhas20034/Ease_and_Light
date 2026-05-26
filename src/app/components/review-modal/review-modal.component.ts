import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalController, ToastController } from '@ionic/angular';
import { HttpApiService } from '../../services/http-api/http-api.service';
import { TranslationService } from '../../services/translations/translation.service';

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './review-modal.component.html',
  styleUrls: ['./review-modal.component.scss']
})
export class ReviewModalComponent {
  @Input() location: any;
  @Input() locationId: string | null = null;
  @Input() reviewType: 'location' | 'route' = 'location';
  @Input() routeId: string | null = null;

  rating = 5;
  title = '';
  description = '';
  photos: string[] = [];
  saving = false;
  expandedPhotoIndex: number | null = null;

  get isRouteReview(): boolean {
    return this.reviewType === 'route' || String(this.locationId || '').startsWith('route-');
  }

  get headerTitle(): string {
    return this.isRouteReview ? this.t.translate('review_route') : this.t.translate('leave_review');
  }

  get targetName(): string {
    if (this.isRouteReview) {
      return this.routeId || String(this.locationId || '').replace(/^route-/, '');
    }
    return this.location?.nome || this.location?.name || this.t.translate('leave_review');
  }

  constructor(private modalCtrl: ModalController, private httpApi: HttpApiService, private toastCtrl: ToastController, private t: TranslationService) {}

  tkey(k: string) { return this.t.translate(k); }

  getLocationId(location: any): string {
    return String(location?.id_estabelecimento || location?.id || location?.id_localizacao || location?.id_estabelecimento_supabase || '');
  }

  setRating(n: number) {
    this.rating = n;
  }

  dismiss(data: any = null) {
    this.modalCtrl.dismiss(data);
  }

  async onFilesSelected(ev: any) {
    const files: FileList = ev.target.files;
    for (let i = 0; i < files.length; i++) {
      const f = files.item(i);
      if (!f) continue;
      const base64 = await this.fileToBase64(f);
      if (base64) this.photos.push(base64);
    }
  }

  fileToBase64(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(String(reader.result));
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  togglePhotoSize(idx: number) {
    this.expandedPhotoIndex = this.expandedPhotoIndex === idx ? null : idx;
  }

  removePhoto(idx: number) {
    if (this.expandedPhotoIndex === idx) this.expandedPhotoIndex = null;
    this.photos.splice(idx, 1);
  }

  async submit() {
    if (!this.rating || this.rating < 1 || this.rating > 5) {
      const t = await this.toastCtrl.create({ message: this.t.translate('rating') + ' required (1-5)', duration: 1500, color: 'danger' });
      t.present();
      return;
    }
    this.saving = true;
    try {
      const currentUser = localStorage.getItem('currentUser');
      let userId = null;
      try { userId = currentUser ? JSON.parse(currentUser)?.id_utilizador : null; } catch(e) {}

      const payload: any = {
        locationId: this.locationId || this.getLocationId(this.location),
        userId: userId,
        rating: Number(this.rating),
        title: this.title,
        description: this.description,
        photos: this.photos
      };

      await this.httpApi.createReview(payload);
      const toast = await this.toastCtrl.create({
        message: this.t.translate(this.isRouteReview ? 'route_review_saved' : 'review_saved'),
        duration: 1500,
        color: 'success'
      });
      toast.present();
      try { localStorage.setItem('refreshMapAfterReview', '1'); } catch (ignore) {}
      this.dismiss({ saved: true });
    } catch (e) {
      console.error('Save review failed', e);
      const toast = await this.toastCtrl.create({ message: this.t.translate('review_save_error'), duration: 2000, color: 'danger' });
      toast.present();
    } finally {
      this.saving = false;
    }
  }
}

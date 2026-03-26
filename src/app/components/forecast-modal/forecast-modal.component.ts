import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { WeatherData, ForecastData } from '../../services/weather/weather.service';
import { TranslationService } from '../../services/translations/translation.service';

@Component({
  selector: 'app-forecast-modal',
  templateUrl: './forecast-modal.component.html',
  styleUrls: ['./forecast-modal.component.scss'],
  standalone: false
})
export class ForecastModalComponent {
  @Input() cityName: string = '';
  @Input() forecast: any[] = [];
  @Input() headerTitle: string = '';
  @Input() weather: WeatherData | null = null;
  @Input() langCode: string = 'PT';

  constructor(private modalCtrl: ModalController, private tService: TranslationService) {}

  close() {
    this.modalCtrl.dismiss();
  }

  t(key: string): string {
    return this.tService.translate(key);
  }

  getTranslatedDescription(weatherCode: number): string {
    const key = `weather_${weatherCode}`;
    return this.t(key);
  }

  getFormattedDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const locale = this.langCode === 'PT' ? 'pt-PT' : 'en-US';
    return d.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
  }
}

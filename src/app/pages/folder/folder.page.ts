import { Component, OnInit, ViewChild } from '@angular/core';
import { SupabaseService } from '../../services/supabase/supabase';
import { LocationService } from '../../services/location/location.service';
import { WeatherService, WeatherData, ForecastData } from '../../services/weather/weather.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslationService } from '../../services/translations/translation.service';
import { AlertController, ModalController } from '@ionic/angular';
import { ForecastModalComponent } from '../../components/forecast-modal/forecast-modal.component';
import * as L from 'leaflet';

try {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
} catch {}
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

@Component({ selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: false,
})
export class FolderPage implements OnInit {
  @ViewChild('mapContainer', { static: false }) mapContainer: any;
  
  items: any[] = [];
  public folder!: string;
  public errorMsg: string | null = null;
  public locationError: string | null = null;
  private map: L.Map | null = null;
  private userMarker: L.Marker | null = null;
  private locationMarkers: L.Marker[] = [];
  private watchId: number | null = null;
  private sampleTimer: any = null;
  private weatherTimer: any = null;
  public lastLat: number | null = null;
  public lastLng: number | null = null;
  public accuracy: number | null = null;
  public locationStatus: string | null = null;
  public weather: WeatherData | null = null;
  public weatherError: string | null = null;
  public forecast: ForecastData[] | null = null;
  
  constructor(
    private supabase: SupabaseService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public tService: TranslationService,
    private locationService: LocationService,
    private weatherService: WeatherService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) {}

  get langCode() {
    try {
      return this.tService.getLang().toUpperCase();
    } catch {
      return 'PT';
    }
  }

  async ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
  }

  ionViewDidEnter() {
    this.initializeMap();
    // Iniciar o timer para atualizar os dados meteorológicos periodicamente
    this.startWeatherTimer();
  }

  private initializeMap() {
    if (!this.mapContainer || this.map) return;

    const mapElement = this.mapContainer.nativeElement as HTMLElement;
    this.map = L.map(mapElement, {
      worldCopyJump: false,
      minZoom: 4,
      maxZoom: 19,
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 1.0
    }).setView([40.7128, -74.0060], 15);

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      noWrap: true,
      minZoom: 4
    }).addTo(this.map);

    tiles.on('tileerror', (err) => console.error('Tile load error', err));
    tiles.on('tileload', (e) => {
    });

    setTimeout(() => {
      try {
        this.map?.invalidateSize();
      } catch (e) {}
    }, 200);

    this.loadUserLocationOnMap();
    // carregar e desenhar marcadores de todas as localizações
    this.loadAllLocationMarkers();
  }

  private async loadAllLocationMarkers() {
    try {
      const data: any = await this.supabase.getAllLocalizacoes();
      const rows = Array.isArray(data) ? data : (data?.data || []);
      for (const r of rows) {
        const lat = Number(r.lat || r.latitude || r.latitud || 0);
        const lon = Number(r.lon || r.longitude || r.longitud || r.lon || 0);
        if (!this.map || !lat || !lon || isNaN(lat) || isNaN(lon)) continue;
        const title = (r.nome || r.nome_rua || r.nome_estabelecimento || r.descr || r.descricao || r.name || `Estab ${r.id_estabelecimento || ''}`);
        const marker = L.marker([lat, lon]).addTo(this.map!);
        // popup com detalhes 
        const popupHtml = `<div><strong>${title}</strong><br/>${r.email ? 'Email: '+r.email+'<br/>' : ''}${r.telefone ? 'Tel: '+r.telefone+'<br/>' : ''}${r.nome_rua ? 'Rua: '+r.nome_rua+'<br/>' : ''}${r.cod_postal ? 'CP: '+r.cod_postal : ''}</div>`;
        marker.bindPopup(popupHtml);
        this.locationMarkers.push(marker);
      }
    } catch (e) {
      console.warn('Failed to load location markers', e);
    }
  }

  private async loadWeather(lat: number, lng: number) {
    try {
      this.weather = await this.weatherService.getCurrentWeather(lat, lng);
      this.weatherError = null;
    } catch (error) {
      console.error('Error loading weather:', error);
      this.weatherError = 'Unable to load weather data';
      this.weather = null;
    }
  }

  private startWeatherTimer() {
    // Refresh weather every 10 minutes
    this.weatherTimer = setInterval(() => {
      if (this.lastLat && this.lastLng) {
        this.loadWeather(this.lastLat, this.lastLng);
      }
    }, 10 * 60 * 1000); // 10 minutes
  }

  private async loadUserLocationOnMap() {
    try {
      const cached = localStorage.getItem('lastKnownLocation');
      if (cached) {
        const data = JSON.parse(cached);
        const { lat, lng, acc, timestamp } = data;
        const ageMs = Date.now() - (timestamp || 0);
        const ageMins = ageMs / 60000;
        if (ageMins < 5 && acc != null && acc <= 1000) {
          this.lastLat = lat;
          this.lastLng = lng;
          this.accuracy = acc;
          this.locationStatus = `Cached location (${Math.round(ageMins)} min old). Fetching fresh fix...`;
          if (this.map && !this.userMarker) {
            this.userMarker = L.marker([lat, lng]).addTo(this.map).bindPopup('Your Location (cached)');
            this.map.setView([lat, lng], 15);
          }
        }
      }
    } catch (e) {}

    try {
      const loc = await this.locationService.getBestLocation();
      this.locationError = null;
      this.lastLat = loc.lat;
      this.lastLng = loc.lng;
      this.accuracy = loc.acc;
      this.locationStatus = `Location (${loc.source}) - accuracy ${loc.acc != null ? Math.round(loc.acc) + ' m' : 'unknown'}`;
      try { localStorage.setItem('lastKnownLocation', JSON.stringify({ lat: loc.lat, lng: loc.lng, acc: loc.acc, timestamp: Date.now() })); } catch (e) {}

      if (this.map) {
        if (!this.userMarker) this.userMarker = L.marker([loc.lat, loc.lng]).addTo(this.map).bindPopup('Your Location');
        else this.userMarker.setLatLng([loc.lat, loc.lng]);
        this.map.setView([loc.lat, loc.lng], 15);
      }

      // Buscar e exibir dados meteorológicos para a localização atual
      this.loadWeather(loc.lat, loc.lng);
    } catch (e) {
      console.warn('Could not obtain location:', e);
      this.locationStatus = 'Unable to obtain accurate location. Enable device GPS or test on a mobile device.';
    }
  }

  retryLocation() {
    try {
      if (this.watchId != null && navigator.geolocation && (navigator.geolocation as any).clearWatch) {
        navigator.geolocation.clearWatch(this.watchId);
      }
    } catch (e) {}
    this.watchId = null;
    try { if (this.sampleTimer) { clearTimeout(this.sampleTimer); this.sampleTimer = null; } } catch (e) {}

    this.accuracy = null;
    this.lastLat = null;
    this.lastLng = null;
    this.locationError = null;
    this.locationStatus = 'Retrying location...';
    if (this.userMarker && this.map) {
      this.map.removeLayer(this.userMarker);
      this.userMarker = null;
    }
    this.loadUserLocationOnMap();
  }

  ionViewWillLeave() {
    try {
      if (this.watchId != null && navigator.geolocation && (navigator.geolocation as any).clearWatch) {
        navigator.geolocation.clearWatch(this.watchId);
      }
    } catch (e) {}
    this.watchId = null;
    try { if (this.sampleTimer) { clearTimeout(this.sampleTimer); this.sampleTimer = null; } } catch (e) {}
    try { if (this.weatherTimer) { clearInterval(this.weatherTimer); this.weatherTimer = null; } } catch (e) {}
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  toggleLang() {
    this.tService.toggleLang();
  }

  t(key: string) {
    return this.tService.translate(key);
  }

  getTranslatedWeatherDescription(weatherCode: number): string {
    const key = `weather_${weatherCode}`;
    return this.t(key);
  }

  async openWeatherForecast() {
    const alert = await this.alertCtrl.create({
      header: this.t('search_forecast'),
      inputs: [
        {
          name: 'city',
          type: 'text',
          placeholder: this.t('enter_city_name')
        }
      ],
      buttons: [
        {
          text: this.t('cancel'),
          role: 'cancel'
        },
        {
          text: this.t('search'),
          handler: async (data) => {
            if (data.city && data.city.trim()) {
              await this.searchCityForecast(data.city.trim());
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async searchCityForecast(cityName: string) {
    try {
      this.forecast = await this.weatherService.get7DayForecast(cityName);
      await this.showForecastAlert(cityName);
    } catch (error) {
      const errorAlert = await this.alertCtrl.create({
        header: this.t('error'),
        message: this.t('could_not_find_forecast'),
        buttons: ['OK']
      });
      await errorAlert.present();
    }
  }

  async showForecastAlert(cityName: string) {
    if (!this.forecast) return;

    const modal = await this.modalCtrl.create({
      component: ForecastModalComponent,
      componentProps: {
        cityName: cityName,
        forecast: this.forecast,
        headerTitle: this.t('forecast_7_days'),
        weather: this.weather,
        langCode: this.langCode
      }
    });
    
    await modal.present();
  }
}

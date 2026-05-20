import { Component, OnInit, ViewChild } from '@angular/core';
import { LocationService } from '../../services/location/location.service';
import { WeatherService, WeatherData, ForecastData } from '../../services/weather/weather.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslationService } from '../../services/translations/translation.service';
import { HttpApiService } from '../../services/http-api/http-api.service';
import { AlertController, ModalController } from '@ionic/angular';
import { ForecastModalComponent } from '../../components/forecast-modal/forecast-modal.component';
import { ReviewModalComponent } from '../../components/review-modal/review-modal.component';
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
  private activeRouteLayer: L.Layer | null = null;
  private watchId: number | null = null;
  private sampleTimer: any = null;
  private weatherTimer: any = null;
  private routeCheckTimer: any = null;
  private lastRouteString: string | null = null;
  private firstRouteDrawn = false;
  private lastRouteStartedAtUser = false;
  public lastLat: number | null = null;
  public lastLng: number | null = null;
  public accuracy: number | null = null;
  public locationStatus: string | null = null;
  public weather: WeatherData | null = null;
  public weatherError: string | null = null;
  public forecast: ForecastData[] | null = null;
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public tService: TranslationService,
    private locationService: LocationService,
    private weatherService: WeatherService,
    private httpApi: HttpApiService,
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
    this.startWeatherTimer();
    try { if (this.routeCheckTimer) clearInterval(this.routeCheckTimer); } catch (e) {}
    this.routeCheckTimer = setInterval(() => { this.checkAndDrawOngoingRoute(); }, 60000);

    try {
      (window as any).__debug_checkOngoing = async () => {
        try {
          console.log('[Debug] calling httpApi.getAll("grupo-percurso")');
          const parsed = await this.httpApi.getAll('grupo-percurso');
          console.log('[Debug] parsed grupo-percurso:', parsed);
        } catch (e) { console.warn('[Debug] error parsing grupo-percurso via httpApi', e); }

        try {
          const base = (this.httpApi as any).apiUrl || '';
          console.log('[Debug] fetching raw backend at', base + '/api/grupo-percurso');
          const res = await fetch(base + '/api/grupo-percurso');
          const raw = await res.json();
          console.log('[Debug] raw backend response:', raw);
        } catch (e) { console.warn('[Debug] error fetching raw backend', e); }
      };
    } catch (e) {}
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

    this.loadUserLocationOnMap().finally(() => {
      this.loadAllLocationMarkers().then(() => this.checkAndDrawOngoingRoute());
    });
  }

  async checkAndDrawOngoingRoute() {
    try {
      console.log('[FolderPage] Checking for ongoing routes...');
      if (!this.map) return;
      const gpData: any = await this.httpApi.getAll('grupo-percurso');
      console.log('[FolderPage] Raw grupo-percurso data:', gpData);
      const grupoPercursos = Array.isArray(gpData) ? gpData : (gpData?.data || []);
      console.log('[FolderPage] Parsed grupo-percurso count:', grupoPercursos.length);
      const ongoing = grupoPercursos.find((g: any) => Number(g.id_estado) === 2 || Number(g.estado) === 2 || (g.estado === undefined && !!g.data_hora_inicio) || (g.id_estado === undefined && !!g.data_inicio));
      console.log('[FolderPage] Ongoing found:', ongoing || 'none');
      if (!ongoing) return;

      const percursoId = ongoing.id_percurso || ongoing.id_percrso || ongoing.id_percrso || ongoing.id_percurso;
      console.log('[FolderPage] Ongoing percurso id:', percursoId);
      if (!percursoId) return;

      const etapasPercursoData: any = await this.httpApi.getAll('etapas-percurso');
      const etapasPercurso = Array.isArray(etapasPercursoData) ? etapasPercursoData : (etapasPercursoData?.data || []);
      const etapasFor = etapasPercurso.filter((ep: any) => String(ep.id_percurso || ep.id_percrso || ep.id_percurso) === String(percursoId));
      console.log('[FolderPage] etapas_percurso for percurso:', etapasFor.length, etapasFor);
      if (!etapasFor.length) {
        console.log('[FolderPage] No etapas_percurso relations found for percurso', percursoId);
        return;
      }

      const allEtapasData: any = await this.httpApi.getAllEtapas();
      const etapas = Array.isArray(allEtapasData) ? allEtapasData : (allEtapasData?.data || []);
      console.log('[FolderPage] Loaded etapas count:', etapas.length);

      const allEstabelecimentosData: any = await this.httpApi.getAllEstabelecimento();
      const estabelecimentos = Array.isArray(allEstabelecimentosData) ? allEstabelecimentosData : (allEstabelecimentosData?.data || []);
      console.log('[FolderPage] Loaded estabelecimentos count:', estabelecimentos.length);

      const orderedEtapasRefs = etapasFor
        .map((ep: any) => ({
          ...ep,
          etapaId: ep.id_etapa || ep.id_etap || ep.id_etapas
        }))
        .filter((ep: any) => ep.etapaId !== undefined && ep.etapaId !== null)
        .sort((a: any, b: any) => Number(a.etapaId) - Number(b.etapaId));

      const coords: Array<[number, number]> = [];
      for (const epRef of orderedEtapasRefs) {
        const etapa = etapas.find((e: any) => String(e.id_etapa || e.id_etap) === String(epRef.etapaId));
        if (!etapa) {
          console.warn('[FolderPage] etapa record missing for id', epRef.etapaId, epRef);
          continue;
        }

        const estabelecimentoId = etapa.id_estabelecimento ?? etapa.id_estab ?? etapa.estabelecimento_id;
        if (!estabelecimentoId) {
          console.warn('[FolderPage] etapa has no estabelecimento id', etapa);
          continue;
        }

        const estabelecimento = estabelecimentos.find((e: any) => String(e.id_estabelecimento ?? e.id_estab ?? e.id) === String(estabelecimentoId));
        if (!estabelecimento) {
          console.warn('[FolderPage] estabelecimento record missing for id', estabelecimentoId, etapa);
          continue;
        }

        const lat = Number((estabelecimento.lat ?? estabelecimento.latitude ?? estabelecimento.latitud ?? estabelecimento.lat) || 0);
        const lon = Number((estabelecimento.lon ?? estabelecimento.longitude ?? estabelecimento.longitud ?? estabelecimento.lng ?? estabelecimento.lon) || 0);
        if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
          console.warn('[FolderPage] invalid estabelecimento coordinates', estabelecimentoId, estabelecimento);
          continue;
        }

        const last = coords[coords.length - 1];
        if (!last || last[0] !== lat || last[1] !== lon) {
          coords.push([lat, lon]);
        }
      }

      if (!coords.length) {
        console.log('[FolderPage] No establishment coordinates could be resolved for percurso', percursoId);
        return;
      }

      const finalCoords = [...coords];
      if (this.lastLat != null && this.lastLng != null) {
        const first = finalCoords[0];
        if (first[0] !== this.lastLat || first[1] !== this.lastLng) {
          finalCoords.unshift([this.lastLat, this.lastLng]);
        }
      }

      let routeCoords = await this.getStreetRouteCoordinates(finalCoords);
      const lastStop = coords[coords.length - 1];
      if (routeCoords.length > 0 && lastStop) {
        const lastRoutePoint = routeCoords[routeCoords.length - 1];
        if (lastRoutePoint[0] !== lastStop[0] || lastRoutePoint[1] !== lastStop[1]) {
          console.warn('[FolderPage] forcing route end to last stop', lastRoutePoint, lastStop);
          routeCoords = [...routeCoords, lastStop];
        }
      }
      const routeKey = JSON.stringify(routeCoords);
      if (routeKey === this.lastRouteString) {
        console.log('[FolderPage] Route unchanged, skipping redraw');
        return;
      }
      this.lastRouteString = routeKey;
      console.log('[FolderPage] Final street route coords to draw:', routeCoords);
      this.removeActiveRoute();
      const line = L.polyline(routeCoords as any, { color: 'blue', weight: 5, opacity: 0.8, smoothFactor: 1 }).addTo(this.map!);
      const routeMarkers = L.layerGroup();
      if (routeCoords.length > 0) {
        routeMarkers.addLayer(L.circleMarker(routeCoords[0], { radius: 7, color: 'white', weight: 3, fillColor: 'blue', fillOpacity: 1 }).bindPopup('Start'));
        if (routeCoords.length > 1) {
          const lastPoint = routeCoords[routeCoords.length - 1];
          routeMarkers.addLayer(L.circleMarker(lastPoint, { radius: 7, color: 'white', weight: 3, fillColor: 'red', fillOpacity: 1 }).bindPopup('End'));
        }
      }
      const routeLayer = L.layerGroup([line, routeMarkers]);
      routeLayer.addTo(this.map!);
      this.activeRouteLayer = routeLayer;
      try {
        const userPosition = (this.lastLat != null && this.lastLng != null) ? [this.lastLat, this.lastLng] as [number, number] : null;
        if (!this.firstRouteDrawn) {
          if (routeCoords.length > 1) {
            const bounds = line.getBounds();
            if (userPosition) {
              bounds.extend(userPosition as any);
            }
            this.map?.fitBounds(bounds, { padding: [50, 50] });
          } else if (userPosition) {
            this.map?.setView(userPosition, 15);
          } else {
            this.map?.setView(routeCoords[0], 15);
          }
          this.firstRouteDrawn = true;
        }
      } catch (e) {
        console.warn('Could not fit route bounds', e);
      }
      try { this.map?.invalidateSize(); } catch (e) {}
    } catch (e) {
      console.warn('Error drawing ongoing route', e);
    }
  }

  private async getStreetRouteCoordinates(points: Array<[number, number]>): Promise<Array<[number, number]>> {
    if (!points || points.length < 2) {
      return points;
    }

    const normalizeRouteEndpoints = (routeCoords: Array<[number, number]>, originalPoints: Array<[number, number]>): Array<[number, number]> => {
      if (!routeCoords.length || !originalPoints.length) return routeCoords;
      const normalized = [...routeCoords];
      const [firstInput] = originalPoints;
      if (firstInput && (normalized[0][0] !== firstInput[0] || normalized[0][1] !== firstInput[1])) {
        normalized.unshift(firstInput);
      }
      const lastInput = originalPoints[originalPoints.length - 1];
      if (lastInput && (normalized[normalized.length - 1][0] !== lastInput[0] || normalized[normalized.length - 1][1] !== lastInput[1])) {
        normalized.push(lastInput);
      }
      return normalized;
    };

    const fetchOsrmRoute = async (coords: Array<[number, number]>): Promise<Array<[number, number]>> => {
      const coordsString = coords.map(([lat, lon]) => `${lon},${lat}`).join(';');
      const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`OSRM returned ${response.status}`);
      }
      const data = await response.json();
      const route = data?.routes?.[0];
      if (!route?.geometry?.coordinates || !Array.isArray(route.geometry.coordinates)) {
        throw new Error('OSRM returned invalid route geometry');
      }
      const mapped = (route.geometry.coordinates as Array<[number, number]>).map(([lon, lat]) => [lat, lon] as [number, number]);
      return normalizeRouteEndpoints(mapped, coords);
    };

    console.log('[FolderPage] Street routing request for points:', points);
    try {
      return await fetchOsrmRoute(points);
    } catch (error) {
      console.warn('[FolderPage] OSRM full-route failed:', error);
      const streetCoords: Array<[number, number]> = [];
      for (let i = 0; i < points.length - 1; i++) {
        const segment = [points[i], points[i + 1]] as Array<[number, number]>;
        try {
          const segmentRoute = await fetchOsrmRoute(segment);
          if (segmentRoute.length) {
            if (streetCoords.length && streetCoords[streetCoords.length - 1][0] === segmentRoute[0][0] && streetCoords[streetCoords.length - 1][1] === segmentRoute[0][1]) {
              streetCoords.push(...(segmentRoute.slice(1) as Array<[number, number]>));
            } else {
              streetCoords.push(...(segmentRoute as Array<[number, number]>));
            }
          }
        } catch (segError) {
          console.warn('[FolderPage] OSRM segment failed, using direct point for segment', segment, segError);
          if (!streetCoords.length || streetCoords[streetCoords.length - 1][0] !== points[i][0] || streetCoords[streetCoords.length - 1][1] !== points[i][1]) {
            streetCoords.push(points[i]);
          }
          streetCoords.push(points[i + 1]);
        }
      }
      if (streetCoords.length) {
        return streetCoords;
      }
      console.warn('[FolderPage] Street routing failed completely, falling back to straight line');
      return points;
    }
  }

  removeActiveRoute() {
    try {
      if (this.activeRouteLayer && this.map) {
        this.map.removeLayer(this.activeRouteLayer as any);
        this.activeRouteLayer = null;
      }
    } catch (e) {
      console.warn('Failed to remove active route layer', e);
    }
  }

  private async loadAllLocationMarkers() {
    try {
      const data: any = await this.httpApi.getAllLocalizacoes();
      const rows = Array.isArray(data) ? data : (data?.data || []);
      for (const r of rows) {
        const lat = Number(r.lat || r.latitude || r.latitud || 0);
        const lon = Number(r.lon || r.longitude || r.longitud || r.lon || 0);
        if (!this.map || !lat || !lon || isNaN(lat) || isNaN(lon)) continue;
        const title = (r.nome || r.nome_rua || r.nome_estabelecimento || r.descr || r.descricao || r.name || `Estab ${r.id_estabelecimento || ''}`);
        const marker = L.marker([lat, lon]).addTo(this.map!);
        const popupHtml = this.getLocationPopupHtml(r, title);
        marker.bindPopup(popupHtml);
        marker.on('popupopen', (ev: any) => {
          try {
            ev.popup.setContent(this.getLocationPopupHtml(r, title));
            const el = ev.popup.getElement();
            if (!el) return;
            const addBtn = el.querySelector('.add-review-btn');
            const viewBtn = el.querySelector('.view-reviews-btn');
            if (addBtn) {
              addBtn.addEventListener('click', (evt: any) => {
                evt.preventDefault(); evt.stopPropagation();
                try { this.openReviewModalForLocation(r); } catch (e) { console.warn(e); }
              });
            }
            if (viewBtn) {
              viewBtn.addEventListener('click', (evt: any) => {
                evt.preventDefault(); evt.stopPropagation();
                try { this.openReviewsListModal(r); } catch (e) { console.warn(e); }
              });
            }
          } catch (e) { console.warn('popupopen handler error', e); }
        });
        this.locationMarkers.push(marker);
      }
    } catch (e) {
      console.warn('Failed to load location markers', e);
    }
  }

  getLocationPopupHtml(r: any, title: string) {
    const addLabel = this.t('add_review');
    const viewLabel = this.t('view_reviews');
    return `<div><strong>${title}</strong><br/>${r.email ? 'Email: '+r.email+'<br/>' : ''}${r.telefone ? 'Tel: '+r.telefone+'<br/>' : ''}${r.nome_rua ? 'Rua: '+r.nome_rua+'<br/>' : ''}${r.cod_postal ? 'CP: '+r.cod_postal + '<br/>' : ''}<div style="margin-top:8px"><button class="add-review-btn" data-loc="${r.id_estabelecimento || r.id}">${addLabel}</button> <button class="view-reviews-btn" data-loc="${r.id_estabelecimento || r.id}">${viewLabel}</button></div></div>`;
  }

  async openReviewModalForLocation(location: any) {
    const locationId = String(location?.id_estabelecimento || location?.id || location?.id_localizacao || location?.id_estabelecimento_supabase || '');
    const modal = await this.modalCtrl.create({
      component: ReviewModalComponent,
      componentProps: { location, locationId }
    });
    await modal.present();
    const res = await modal.onDidDismiss();
    if (res?.data?.saved) {
    }
  }

  async openReviewsListModal(location: any) {
    const locationId = String(location?.id_estabelecimento || location?.id || location?.id_localizacao || location?.id_estabelecimento_supabase || '');
    const { ReviewListComponent } = await import('../../components/review-list/review-list.component');
    const modal = await this.modalCtrl.create({
      component: ReviewListComponent,
      componentProps: { location, locationId }
    });
    await modal.present();
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
    this.weatherTimer = setInterval(() => {
      if (this.lastLat && this.lastLng) {
        this.loadWeather(this.lastLat, this.lastLng);
      }
    }, 10 * 60 * 1000); 
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

      if (this.activeRouteLayer || this.lastRouteString) {
        this.checkAndDrawOngoingRoute().catch(() => {});
      }

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
    try { if (this.routeCheckTimer) { clearInterval(this.routeCheckTimer); this.routeCheckTimer = null; } } catch (e) {}
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  goToCreateLocation() {
    this.router.navigate(['/peregrino/cria-localizacao']);
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

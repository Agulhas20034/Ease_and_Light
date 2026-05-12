import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { LocationService } from '../../../services/location/location.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';
import * as L from 'leaflet';

try {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
} catch {}
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

@Component({
  selector: 'app-cria-localizacao',
  templateUrl: './cria-localizacao.page.html',
  styleUrls: ['./cria-localizacao.page.scss'],
  standalone: false,
})
export class CriaLocalizacaoPage implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer: any;

  mode: 'map' | 'form' = 'map';

  private map: L.Map | null = null;
  private droppedPin: L.Marker | null = null;
  private userMarker: L.Marker | null = null;
  private locationMarkers: L.Marker[] = [];
  selectedLat: number | null = null;
  selectedLng: number | null = null;

  get hasPin(): boolean {
    return this.selectedLat !== null && this.selectedLng !== null;
  }

  id_tipo_estabelecimento: any = null;
  hora_abertura = '';
  hora_fecho = '';
  email = '';
  telefone = '';
  link = '';
  nome = '';
  lat: any = null;
  lon: any = null;
  cod_postal = '';
  nif = '';
  estado = 1;
  tipos: any[] = [];
  loading = false;

  constructor(
    private httpApi: HttpApiService,
    private locationService: LocationService,
    private router: Router,
    private toastCtrl: ToastController,
    public t: TranslationService
  ) { }

  ngOnInit() {
    this.loadTipos();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.mode === 'map') {
        this.initializeMap();
      }
    }, 200);
  }

  ionViewDidEnter() {
    if (this.mode === 'map') {
      setTimeout(() => this.initializeMap(), 100);
    }
  }

  private initializeMap() {
    if (!this.mapContainer) {
      setTimeout(() => this.initializeMap(), 100);
      return;
    }
    if (this.map) return;

    this.locationMarkers = [];
    this.userMarker = null;

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
    tiles.on('tileload', (e) => {});

    setTimeout(() => {
      try {
        this.map?.invalidateSize();
      } catch (e) {}
    }, 200);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.dropPin(e.latlng.lat, e.latlng.lng);
    });

    this.loadAllLocationMarkers();
    this.loadUserLocationOnMap();
  }

  private dropPin(lat: number, lng: number) {
    if (this.droppedPin) {
      this.map?.removeLayer(this.droppedPin);
    }
    this.droppedPin = L.marker([lat, lng]).addTo(this.map!).bindPopup('Selected location').openPopup();
    this.selectedLat = lat;
    this.selectedLng = lng;
    this.lat = lat;
    this.lon = lng;

    if (this.map) {
      this.map.setView([lat, lng], this.map.getZoom());
    }
  }

  savePinLocation() {
    if (this.hasPin) {
      this.mode = 'form';
      if (this.map) {
        this.map.remove();
        this.map = null;
      }
    }
  }

  async loadTipos() {
    try {
      const r: any = await this.httpApi.getAllTipoEstabelecimento();
      this.tipos = Array.isArray(r) ? r : (r?.data || []);
    } catch (e) {
      console.warn('Failed to load tipos', e);
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
        const popupHtml = `<div><strong>${title}</strong><br/>${r.email ? 'Email: '+r.email+'<br/>' : ''}${r.telefone ? 'Tel: '+r.telefone+'<br/>' : ''}${r.nome_rua ? 'Rua: '+r.nome_rua+'<br/>' : ''}${r.cod_postal ? 'CP: '+r.cod_postal : ''}</div>`;
        marker.bindPopup(popupHtml);
        this.locationMarkers.push(marker);
      }
    } catch (e) {
      console.warn('Failed to load existing locations', e);
    }
  }

  private async loadUserLocationOnMap() {
    try {
      const loc = await this.locationService.getBestLocation();
      if (!this.map) return;
      if (!this.userMarker) {
        this.userMarker = L.marker([loc.lat, loc.lng]).addTo(this.map).bindPopup('Your Location');
      } else {
        this.userMarker.setLatLng([loc.lat, loc.lng]);
      }
      this.map.setView([loc.lat, loc.lng], 15);
    } catch (e) {
      console.warn('Could not obtain user location', e);
    }
  }

  async createLocation() {
    this.loading = true;
    try {
      const rec: any = {
        tipo: this.id_tipo_estabelecimento,
        nome: this.nome,
        lat: this.lat,
        lon: this.lon,
        cod_postal: this.cod_postal,
        estado: this.estado
      };

      const resp: any = await this.httpApi.createEstabelecimentoMinimal(rec);
      console.debug('createEstabelecimento response', resp);

      const toast = await this.toastCtrl.create({ message: this.t.translate('location_created'), duration: 1500, color: 'success' });
      toast.present();
      window.location.href = '/folder/inbox';
    } catch (e) {
      console.error('Create location failed', e);
      const t = await this.toastCtrl.create({ message: this.t.translate('save_error'), duration: 2000, color: 'danger' });
      t.present();
    } finally {
      this.loading = false;
    }
  }

  backToMap() {
    this.mode = 'map';
    this.selectedLat = null;
    this.selectedLng = null;
    this.droppedPin = null;
    setTimeout(() => this.initializeMap(), 100);
  }
}

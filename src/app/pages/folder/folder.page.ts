import { Component, OnInit, ViewChild } from '@angular/core';
import { SupabaseService } from '../../services/supabase/supabase';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslationService } from '../../services/translations/translation.service';
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
  private watchId: number | null = null;
  private sampleTimer: any = null;
  public lastLat: number | null = null;
  public lastLng: number | null = null;
  public accuracy: number | null = null;
  public locationStatus: string | null = null;
  
  constructor(
    private supabase: SupabaseService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public tService: TranslationService
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
  }

  private async loadUserLocationOnMap() {
    if (!navigator.geolocation) {
      this.locationError = 'Geolocation not supported';
      this.locationStatus = 'Geolocation not supported';
      return;
    }

    try {
      const cached = localStorage.getItem('lastKnownLocation');
      if (cached) {
        const data = JSON.parse(cached);
        const { lat, lng, acc, timestamp } = data;
        const ageMs = Date.now() - (timestamp || 0);
        const ageMins = ageMs / 60000;
        if (ageMins < 5) {
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

    let gotGoodFix = false;
    const ACCURACY_THRESHOLD = 100;
    const MAX_SAMPLING_MS = 30000;
    const MIN_SAMPLES = 3;
    const samples: Array<{ lat: number; lng: number; acc: number; ts: number }> = [];
    const samplingStart = Date.now();

    const evaluateSamples = (force = false) => {
      if (samples.length === 0) return null;
      let best = samples[0];
      for (const s of samples) {
        if (s.acc != null && s.acc < best.acc) best = s;
      }
      if (best.acc <= ACCURACY_THRESHOLD) {
        return best;
      }
      if (force && samples.length >= MIN_SAMPLES) return best;
      return null;
    };

    const handlePosition = (position: GeolocationPosition) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const acc = position.coords.accuracy;
      console.log('Geolocation success:', { lat, lng, accuracy: acc });
      this.lastLat = lat;
      this.lastLng = lng;
      this.accuracy = acc;
      this.locationError = null;
      try {
        localStorage.setItem('lastKnownLocation', JSON.stringify({ lat, lng, acc, timestamp: Date.now() }));
      } catch (e) {}

      if (acc == null || acc <= 0) {
        this.locationStatus = `Live location (accuracy unknown)`;
      } else if (acc > ACCURACY_THRESHOLD) {
        this.locationStatus = `Low accuracy (${Math.round(acc)} m). Trying to obtain better GPS fix...`;
      } else {
        this.locationStatus = `Live location (accuracy ${Math.round(acc)} m)`;
      }

      if (acc != null && !isNaN(acc)) {
        samples.push({ lat, lng, acc, ts: Date.now() });
      }

      const bestNow = evaluateSamples();
      if (bestNow && !gotGoodFix) {
        gotGoodFix = true;
        if (this.map) this.map.setView([bestNow.lat, bestNow.lng], 15);
        this.locationStatus = `Live location (accuracy ${Math.round(bestNow.acc)} m)`;
      }

      if (this.map) {
        if (!this.userMarker) {
          this.userMarker = L.marker([lat, lng]).addTo(this.map).bindPopup('Your Location');
        } else {
          this.userMarker.setLatLng([lat, lng]);
        }

        if (!gotGoodFix && acc <= ACCURACY_THRESHOLD) {
          gotGoodFix = true;
          this.map.setView([lat, lng], 15);
        }
      }
    };

    const handleError = (error: GeolocationPositionError, attempt = 1) => {
      console.warn(`Geolocation error (attempt ${attempt}):`, error);
      if (error.code === error.PERMISSION_DENIED) {
        this.locationError = 'Permission denied. Allow location access and retry.';
        this.locationStatus = 'Permission denied';
        return;
      }

      if (error.code === error.TIMEOUT) {
        console.log('getCurrentPosition timed out; watch will continue');
        return;
      }

      this.locationError = `Error: ${error.message}`;
      this.locationStatus = `Error: ${error.message}`;
    };

    const fastOptions: PositionOptions = { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 };
    navigator.geolocation.getCurrentPosition(handlePosition, (err) => handleError(err, 1), fastOptions);

    try {
      this.watchId = navigator.geolocation.watchPosition(
        handlePosition,
        (err) => handleError(err, 2),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    } catch (e) {
      console.warn('watchPosition unavailable', e);
    }

    try {
      if (this.sampleTimer) clearTimeout(this.sampleTimer);
      this.sampleTimer = setTimeout(() => {
        const forcedBest = evaluateSamples(true);
        if (forcedBest && !gotGoodFix) {
          this.locationStatus = `Using best available location (accuracy ${Math.round(forcedBest.acc)} m). Enable GPS for better accuracy.`;
          if (this.map) this.map.setView([forcedBest.lat, forcedBest.lng], 15);
          this.lastLat = forcedBest.lat;
          this.lastLng = forcedBest.lng;
          this.accuracy = forcedBest.acc;
        } else if (!forcedBest) {
          this.locationStatus = 'Unable to obtain accurate GPS fix. Please enable device GPS and try again.';
        }
      }, MAX_SAMPLING_MS + 1000);
    } catch (e) {}

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

  getDisplayText(item: any): string {
    if (item == null) return '';
    if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') return String(item);

    const candidates = ['nome', 'name', 'title', 'descricao', 'description', 'label', 'id_utilizador', 'id'];
    for (const key of candidates) {
      if (Object.prototype.hasOwnProperty.call(item, key) && item[key] != null) {
        return String(item[key]);
      }
    }

    for (const k of Object.keys(item)) {
      const v = item[k];
      if (typeof v === 'string' && v.trim().length) return v;
    }

    try {
      const json = JSON.stringify(item);
      return json.length > 120 ? json.slice(0, 117) + '...' : json;
    } catch {
      return String(item);
    }
  }
}

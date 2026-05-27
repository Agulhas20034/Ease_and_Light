import { Component, OnInit } from '@angular/core';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { TranslationService } from '../../../services/translations/translation.service';
import { ModalController } from '@ionic/angular';
import * as L from 'leaflet';

@Component({
  selector: 'app-reviews-percurso',
  templateUrl: './reviews-percurso.page.html',
  styleUrls: ['./reviews-percurso.page.scss'],
  standalone: false
})
export class ReviewsPercursoPage implements OnInit {
  routes: any[] = [];
  routeReviews: any[] = [];
  routeReviewsByRouteId: Record<string, any[]> = {};
  selectedReviewRouteId: string | null = null;
  reviewModalOpen = false;
  selectedRouteReviews: any[] = [];
  selectedRouteAvg: number | null = null;
  selectedImageKey: string | null = null;
  selectedImageSrc: string | null = null;
  private _domImageOverlay: HTMLElement | null = null;
  loading = false;
  selectedRoute: any = null;
  previewMap: L.Map | null = null;
  activeTab = 'view-routes';

  constructor(
    private httpApi: HttpApiService,
    public t: TranslationService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadRoutes();
    this.loadRouteReviews();
  }

  async loadRoutes() {
    this.loading = true;
    try {
      const data: any = await this.httpApi.getAll('percurso');
      this.routes = Array.isArray(data) ? data : (data?.data || []);
      console.log('[ReviewsPercurso] Loaded routes:', this.routes.length);
    } catch (error) {
      console.warn('Error loading routes', error);
    } finally {
      this.loading = false;
    }
  }

  async loadRouteReviews() {
    this.loading = true;
    try {
      const data: any = await this.httpApi.getAll('reviews');
      const allReviews = Array.isArray(data) ? data : (data?.data || []);
      this.routeReviews = allReviews.filter((r: any) => 
        String(r.locationId || '').trim().startsWith('route-')
      );
      this.routeReviewsByRouteId = this.groupRouteReviewsByRouteId(this.routeReviews);
      const distinctKeys = Object.keys(this.routeReviewsByRouteId);
      console.log('[ReviewsPercurso] Loaded route reviews:', this.routeReviews.length, 'distinct route keys:', distinctKeys);
      if (!distinctKeys.includes('6')) {
        console.warn('[ReviewsPercurso] route-6 not found among review keys:', distinctKeys.slice(0, 20));
      }
    } catch (error) {
      console.warn('Error loading route reviews', error);
    } finally {
      this.loading = false;
    }
  }

  private groupRouteReviewsByRouteId(reviews: any[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {};
    for (const review of reviews) {
      let routeId = String(review.locationId || '').replace(/^route-/, '');
      routeId = routeId.trim();
      if (!routeId) {
        continue;
      }
      if (!groups[routeId]) {
        groups[routeId] = [];
      }
      groups[routeId].push(review);
    }
    return groups;
  }

  getRouteId(route: any): string {
    return String(route?.id_percurso ?? route?.id ?? '').trim();
  }

  hasRouteReviews(routeId: string): boolean {
    return Array.isArray(this.routeReviewsByRouteId[routeId]) && this.routeReviewsByRouteId[routeId].length > 0;
  }

  getReviewsForRoute(routeId: string | number): any[] {
    return this.routeReviewsByRouteId[String(routeId)] || [];
  }

  selectReviewRoute(routeId: string) {
    if (!this.hasRouteReviews(routeId)) return;
    this.selectedReviewRouteId = routeId;
    this.selectedRouteReviews = this.getReviewsForRoute(routeId);
    if (this.selectedRouteReviews.length) {
      const sum = this.selectedRouteReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
      this.selectedRouteAvg = Math.round((sum / this.selectedRouteReviews.length) * 10) / 10; 
    } else {
      this.selectedRouteAvg = null;
    }
    this.reviewModalOpen = true;
  }

  closeReviewModal() {
    this.reviewModalOpen = false;
    this.selectedReviewRouteId = null;
    this.selectedRouteReviews = [];
    this.selectedRouteAvg = null;
    this.selectedImageKey = null;
    this.selectedImageSrc = null;
    this.removeDomImageOverlay();
  }

  getImageKey(routeId: string | null, reviewIdx: number, imgIdx: number) {
    return `${routeId ?? ''}_${reviewIdx}_${imgIdx}`;
  }

  isImageSelected(key: string | null) {
    return this.selectedImageKey === key;
  }

  toggleImage(key: string | null, src?: string) {
    if (!key) {
      this.selectedImageKey = null;
      this.selectedImageSrc = null;
      this.removeDomImageOverlay();
      return;
    }

    if (this.selectedImageKey === key) {
      this.selectedImageKey = null;
      this.selectedImageSrc = null;
      this.removeDomImageOverlay();
    } else {
      this.selectedImageKey = key;
      this.selectedImageSrc = src || null;
      this.showDomImageOverlay(this.selectedImageSrc);
    }
  }

  private showDomImageOverlay(src: string | null) {
    this.removeDomImageOverlay();
    if (!src || typeof document === 'undefined') return;
    const overlay = document.createElement('div');
    overlay.className = 'reviews-image-dom-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.8)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '2147483647';
    overlay.style.cursor = 'pointer';

    overlay.addEventListener('click', () => {
      this.toggleImage(null);
    });

    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.style.maxWidth = '92%';
    img.style.maxHeight = '92%';
    img.style.borderRadius = '8px';
    img.style.boxShadow = '0 8px 30px rgba(0,0,0,0.6)';
    img.style.objectFit = 'contain';
    overlay.appendChild(img);

    document.body.appendChild(overlay);
    this._domImageOverlay = overlay;
  }

  private removeDomImageOverlay() {
    try {
      if (this._domImageOverlay && this._domImageOverlay.parentElement) {
        this._domImageOverlay.parentElement.removeChild(this._domImageOverlay);
      }
    } catch (e) {
    }
    this._domImageOverlay = null;
  }

  async previewRoute(route: any) {
    this.selectedRoute = route;
    
    try {
      const etapasData: any = await this.httpApi.getAll('etapas-percurso');
      const etapasPercurso = Array.isArray(etapasData) ? etapasData : (etapasData?.data || []);
      const etapasFor = etapasPercurso.filter((ep: any) => 
        String(ep.id_percurso || ep.id_percrso) === String(route.id_percurso)
      );

      const allEtapasData: any = await this.httpApi.getAllEtapas();
      const etapas = Array.isArray(allEtapasData) ? allEtapasData : (allEtapasData?.data || []);

      const allEstabelecimentosData: any = await this.httpApi.getAllEstabelecimento();
      const estabelecimentos = Array.isArray(allEstabelecimentosData) ? allEstabelecimentosData : (allEstabelecimentosData?.data || []);

      const orderedEtapasRefs = etapasFor
        .map((ep: any) => ({
          ...ep,
          etapaId: ep.id_etapa || ep.id_etap
        }))
        .filter((ep: any) => ep.etapaId !== undefined && ep.etapaId !== null)
        .sort((a: any, b: any) => Number(a.etapaId) - Number(b.etapaId));

      const stops: Array<[number, number]> = [];
      for (const epRef of orderedEtapasRefs) {
        const etapa = etapas.find((e: any) => String(e.id_etapa || e.id_etap) === String(epRef.etapaId));
        if (!etapa) continue;

        const estabelecimentoId = etapa.id_estabelecimento ?? etapa.id_estab ?? etapa.estabelecimento_id;
        if (!estabelecimentoId) continue;

        const estabelecimento = estabelecimentos.find((e: any) => 
          String(e.id_estabelecimento ?? e.id_estab ?? e.id) === String(estabelecimentoId)
        );
        if (!estabelecimento) continue;

        const lat = Number(estabelecimento.lat ?? estabelecimento.latitude ?? 0);
        const lon = Number(estabelecimento.lon ?? estabelecimento.longitude ?? 0);
        if (!lat || !lon || isNaN(lat) || isNaN(lon)) continue;

        stops.push([lat, lon]);
      }

      if (stops.length > 0) {
        this.drawPreviewMap(stops);
      }
    } catch (error) {
      console.warn('Error loading route preview', error);
    }
  }

  private async drawPreviewMap(stops: Array<[number, number]>) {
    if (this.previewMap) {
      this.previewMap.remove();
      this.previewMap = null;
    }

    const mapContainer = document.getElementById('preview-map');
    if (!mapContainer) return;

    this.previewMap = L.map(mapContainer).setView(stops[0], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.previewMap);

    let routeCoords = stops;
    try {
      routeCoords = await this.getStreetRouteCoordinates(stops);
    } catch (error) {
      console.warn('[ReviewsPercurso] Failed to get street route, using direct polyline:', error);
    }

    L.polyline(routeCoords, { color: 'blue', weight: 5, opacity: 0.8 }).addTo(this.previewMap);

    stops.forEach((stop, idx) => {
      const color = idx === 0 ? 'green' : (idx === stops.length - 1 ? 'red' : 'orange');
      L.circleMarker(stop, { radius: 8, color: 'white', weight: 3, fillColor: color, fillOpacity: 1 })
        .addTo(this.previewMap!);
    });

    const bounds = L.latLngBounds(stops);
    this.previewMap.fitBounds(bounds, { padding: [50, 50] });
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

    console.log('[ReviewsPercurso] Street routing request for points:', points);
    try {
      return await fetchOsrmRoute(points);
    } catch (error) {
      console.warn('[ReviewsPercurso] OSRM full-route failed:', error);
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
        } catch (segmentError) {
          console.warn(`[ReviewsPercurso] OSRM segment ${i} failed, using direct line:`, segmentError);
          if (streetCoords.length === 0 || !(streetCoords[streetCoords.length - 1][0] === segment[0][0] && streetCoords[streetCoords.length - 1][1] === segment[0][1])) {
            streetCoords.push(segment[0]);
          }
          streetCoords.push(segment[1]);
        }
      }
      return streetCoords.length > 1 ? streetCoords : points;
    }
  }

  tabChanged(event: any) {
    const tab = event.detail.value;
    if (tab === 'view-route-reviews') {
      this.loadRouteReviews();
    }
  }

  getRouteById(routeId: string | number): any {
    return this.routes.find((r: any) => String(r.id_percurso) === String(routeId));
  }

  closePreview() {
    this.selectedRoute = null;
    if (this.previewMap) {
      this.previewMap.remove();
      this.previewMap = null;
    }
  }

  ionViewDidLeave() {
    if (this.previewMap) {
      this.previewMap.remove();
      this.previewMap = null;
    }
  }
}


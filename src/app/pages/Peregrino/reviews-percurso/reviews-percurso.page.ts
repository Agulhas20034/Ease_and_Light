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
        String(r.locationId || '').startsWith('route-')
      );
      console.log('[ReviewsPercurso] Loaded route reviews:', this.routeReviews.length);
    } catch (error) {
      console.warn('Error loading route reviews', error);
    } finally {
      this.loading = false;
    }
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
    if (tab === 'view-route-reviews' && this.routeReviews.length === 0) {
      this.loadRouteReviews();
    }
  }

  getRouteById(routeId: string | number): any {
    return this.routes.find((r: any) => String(r.id_percurso) === String(routeId));
  }

  getReviewsForRoute(routeId: string | number): any[] {
    return this.routeReviews.filter((r: any) => 
      String(r.locationId || '').replace('route-', '') === String(routeId)
    );
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


import { Injectable } from '@angular/core';

export interface LocationResult {
  lat: number;
  lng: number;
  acc: number | null;
  source: 'capacitor' | 'browser';
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  constructor() {}

  async getBestLocation(maxSamplingMs = 30000): Promise<LocationResult> {
    try {
      const cap = (window as any).Capacitor;
      if (cap && cap.getPlatform && cap.getPlatform() !== 'web') {
        const mod = await import('@capacitor/geolocation');
        try {
          if (mod && mod.Geolocation && mod.Geolocation.requestPermissions) {
            await mod.Geolocation.requestPermissions();
          }
        } catch (permErr) {
        }
        const pos = await mod.Geolocation.getCurrentPosition({ enableHighAccuracy: true, maximumAge: 0, timeout: 20000 } as any);
        return { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy ?? null, source: 'capacitor' };
      }
    } catch (e) {
      console.warn('Capacitor geolocation not available / failed:', e);
    }

    return new Promise<LocationResult>((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('No geolocation available'));

      const IGNORE_COARSE = 100000;
      const samples: Array<{ lat: number; lng: number; acc: number; ts: number }> = [];

      function onPos(pos: GeolocationPosition) {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy ?? 0;
        if (acc > IGNORE_COARSE) {
          console.warn('Discarding extremely coarse browser position:', acc);
          return;
        }
        samples.push({ lat, lng, acc, ts: Date.now() });
        if (acc <= 200) {
          cleanup();
          resolve({ lat, lng, acc, source: 'browser' });
        }
      }

      function onErr(err: any) {
        console.warn('Browser geolocation error:', err);
      }

      const watchId = navigator.geolocation.watchPosition(onPos, onErr, { enableHighAccuracy: true, maximumAge: 0 });

      try {
        navigator.geolocation.getCurrentPosition(onPos, onErr, { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
      } catch (e) {
      }

      const timer = setTimeout(() => {
        if (samples.length) {
          const best = samples.reduce((b, s) => (s.acc < b.acc ? s : b), samples[0]);
          cleanup();
          console.warn('Browser geolocation fallback using best available sample:', best);
          resolve({ lat: best.lat, lng: best.lng, acc: best.acc, source: 'browser' });
          return;
        }
        cleanup();
        reject(new Error('No acceptable position'));
      }, maxSamplingMs);

      function cleanup() {
        clearTimeout(timer);
        try { navigator.geolocation.clearWatch(watchId); } catch (e) {}
      }
    });
  }
}

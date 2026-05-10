import { Injectable } from '@angular/core';

export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  city?: string;
  country?: string;
  weatherCode: number;
}

export interface ForecastData {
  date: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private baseUrl = 'https://api.open-meteo.com/v1/forecast';

  constructor() {}

  async getCurrentWeather(lat: number, lng: number): Promise<WeatherData> {
    const locationData = await this.getLocationInfo(lat, lng);
    
    // Open-Meteo API 
    const url = `${this.baseUrl}?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,windspeed_10m&timezone=auto`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      const data = await response.json();

      // Buscar dados atuais e dados horários para umidade e vento
      const current = data.current_weather;
      const hourly = data.hourly;

      // Ver horario atual para obter umidade e vento correspondentes
      const now = new Date();
      const currentHour = now.getHours();
      const humidity = hourly.relative_humidity_2m[currentHour] || 0;
      const windSpeed = hourly.windspeed_10m[currentHour] || 0;

      return {
        temperature: Math.round(current.temperature),
        description: this.getWeatherDescription(current.weathercode),
        icon: this.getWeatherIcon(current.weathercode),
        humidity: humidity,
        windSpeed: windSpeed,
        city: locationData.city,
        country: locationData.country,
        weatherCode: current.weathercode
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  }

  async getLocationInfo(lat: number, lng: number): Promise<{city?: string, country?: string}> {
    try {
      // Nominatim API para obter cidade e país a partir de coordenadas
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Geocoding API error');
      }
      const data = await response.json();
      
      const address = data.address || {};
      return {
        city: address.city || address.town || address.village || address.municipality,
        country: address.country
      };
    } catch (error) {
      console.error('Error fetching location info:', error);
      return {};
    }
  }

  async get7DayForecast(cityName: string): Promise<ForecastData[]> {
    try {
      const coords = await this.getCityCoordinates(cityName);
      if (!coords) {
        throw new Error('City not found');
      }

      const url = `${this.baseUrl}?latitude=${coords.lat}&longitude=${coords.lng}&daily=temperature_2m_max,temperature_2m_min,weathercode,relative_humidity_2m_mean,windspeed_10m_max&timezone=auto`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }
      const data = await response.json();

      const forecast: ForecastData[] = [];
      const daily = data.daily;
      
      for (let i = 0; i < Math.min(7, daily.time.length); i++) {
        forecast.push({
          date: daily.time[i],
          temperature: Math.round((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2),
          description: this.getWeatherDescription(daily.weathercode[i]),
          icon: this.getWeatherIcon(daily.weathercode[i]),
          humidity: daily.relative_humidity_2m_mean[i] || 0,
          windSpeed: daily.windspeed_10m_max[i] || 0,
          weatherCode: daily.weathercode[i]
        });
      }

      return forecast;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  }

  async getCityCoordinates(cityName: string): Promise<{lat: number, lng: number} | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Geocoding API error');
      }
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching city coordinates:', error);
      return null;
    }
  }

  private getWeatherDescription(code: number): string {
    const descriptions: { [key: number]: string } = {
      0: 'Céu limpo',
      1: 'Principalmente limpo',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Nevoeiro',
      48: 'Nevoeiro com geada',
      51: 'Chuvisco leve',
      53: 'Chuvisco moderado',
      55: 'Chuvisco denso',
      56: 'Chuvisco congelado leve',
      57: 'Chuvisco congelado denso',
      61: 'Chuva leve',
      63: 'Chuva moderada',
      65: 'Chuva forte',
      66: 'Chuva congelada leve',
      67: 'Chuva congelada forte',
      71: 'Neve leve',
      73: 'Neve moderada',
      75: 'Neve forte',
      77: 'Grãos de neve',
      80: 'Aguaceiros leves',
      81: 'Aguaceiros moderados',
      82: 'Aguaceiros violentos',
      85: 'Neve leve em aguaceiros',
      86: 'Neve forte em aguaceiros',
      95: 'Trovoada',
      96: 'Trovoada com granizo leve',
      99: 'Trovoada com granizo forte'
    };
    return descriptions[code] || 'Desconhecido';
  }

  private getWeatherIcon(code: number): string {
    const iconMap: { [key: number]: string } = {
      0: '01d', // Clear sky
      1: '02d', // Mainly clear
      2: '03d', // Partly cloudy
      3: '04d', // Overcast
      45: '50d', // Fog
      48: '50d', // Depositing rime fog
      51: '09d', // Drizzle light
      53: '09d', // Drizzle moderate
      55: '09d', // Drizzle dense
      56: '13d', // Freezing drizzle light
      57: '13d', // Freezing drizzle dense
      61: '10d', // Rain slight
      63: '10d', // Rain moderate
      65: '10d', // Rain heavy
      66: '13d', // Freezing rain light
      67: '13d', // Freezing rain heavy
      71: '13d', // Snow slight
      73: '13d', // Snow moderate
      75: '13d', // Snow heavy
      77: '13d', // Snow grains
      80: '09d', // Rain showers slight
      81: '09d', // Rain showers moderate
      82: '09d', // Rain showers violent
      85: '13d', // Snow showers slight
      86: '13d', // Snow showers heavy
      95: '11d', // Thunderstorm
      96: '11d', // Thunderstorm with slight hail
      99: '11d'  // Thunderstorm with heavy hail
    };
    return iconMap[code] || '01d';
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { WeatherDataPoint, NasaApiResponse, Location, DateRange, WeatherVariable } from '../models/weather-data.model';

@Injectable({
  providedIn: 'root'
})
export class NasaApiService {
  private readonly BASE_URLS = {
    GES_DISC: 'https://opendap.earthdata.nasa.gov/',
    GIOVANNI: 'https://giovanni.gsfc.nasa.gov/giovanni/',
    EARTHDATA_SEARCH: 'https://search.earthdata.nasa.gov/',
    DATA_RODS: 'https://nasa-data-rods-hydro.readthedocs.io/'
  };

  private readonly MERRA2_DATASETS: { [key in WeatherVariable['category']]: string } = {
    temperature: 'M2T1NXSLV',
    precipitation: 'M2T1NXFLX',
    wind: 'M2T1NXSLV',
    cloud: 'M2T1NXSLV',
    humidity: 'M2T1NXSLV',
    other: 'M2T1NXSLV'
  };

  // Replace this with your actual Bearer token
  private readonly BEARER_TOKEN = 'eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6ImFuZHJld3BhbmtvIiwiZXhwIjoxNzY0NzcyOTk5LCJpYXQiOjE3NTk1ODg5OTksImlzcyI6Imh0dHBzOi8vdXJzLmVhcnRoZGF0YS5uYXNhLmdvdiIsImlkZW50aXR5X3Byb3ZpZGVyIjoiZWRsX29wcyIsImFjciI6ImVkbCIsImFzc3VyYW5jZV9sZXZlbCI6M30.cNqkU-yma3uhv5deUsGhg2uA6E2xpEIF8ZcW8eF5trpjiEznMnPE_QZBvKSHBf7wQTsou8de6F9ND8R24_YoQjcTHMy7C6PHroVF7_ATHDt-gYOSMmKDclbcduveJztpIdRxHN8QuJUTvuemglqcnKZhss8-S3SnEcPdmES7MLVys7GsFmQDHWSg97LzoG5SXYRZgCCukPkN2DU_ZJjtXPgqyGqRYpwwg36ZGNNuznk9xKbf-ZkXzGqBz2Z8FyIlIAOJGb64K-dlKLxq2v7s4NqeewzZ5b84rJl6p7wxbhrZZoN1IGLJayefjGhTAzj1XeCmFlYYGkbMEGRG1Ea5Zw';

  constructor(private http: HttpClient) {}

  /**
   * Mock Data
   */
  // getWeatherData(
  //   location: Location,
  //   variable: WeatherVariable,
  //   dateRange: DateRange
  // ): Observable<NasaApiResponse> {
  //   // For now, return mock data
  //   // In a real implementation, this would make actual API calls to NASA services
  //   return this.getMockWeatherData(location, variable, dateRange);
  // }

  /**
   * Real Data
   */

  getWeatherData(
    location: Location,
    variable: WeatherVariable,
    dateRange: DateRange
  ): Observable<NasaApiResponse> {
    return this.getGesDiscData(location, variable, dateRange);
  }

  /**
   * Get data from GES DISC OPeNDAP Server
   */
  private getGesDiscData(
    location: Location,
    variable: WeatherVariable,
    dateRange: DateRange
  ): Observable<NasaApiResponse> {
    const dataset = this.MERRA2_DATASETS[variable.category] || 'M2T1NXSLV';
    const nasaVariable = variable.nasaVariable || 'T2M';
    
    // Construct OPeNDAP URL
    const url = `${this.BASE_URLS.GES_DISC}opendap/hyrax/MERRA2/${dataset}/`;
    
    // Add time and spatial constraints
    const timeConstraint = this.buildTimeConstraint(dateRange);
    const spatialConstraint = this.buildSpatialConstraint(location);
    
    const fullUrl = `${url}${nasaVariable}.nc?${timeConstraint}&${spatialConstraint}`;
    
    // Set up headers with the Bearer token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.BEARER_TOKEN}`
    });

    // return this.http.get(fullUrl).pipe(
    //   map(response => this.parseGesDiscResponse(response, variable)),
    //   catchError(error => this.handleApiError(error, 'GES DISC'))
    // );

    return this.http.get(fullUrl, { headers }).pipe(
      map(response => this.parseGesDiscResponse(response, variable)),
      catchError(error => this.handleApiError(error, 'GES DISC'))
    );
  }

  /**
   * Get data from Giovanni Web Services
   */
  private getGiovanniData(
    location: Location,
    variable: WeatherVariable,
    dateRange: DateRange
  ): Observable<NasaApiResponse> {
    // Giovanni API implementation would go here
    // This is a placeholder for the actual implementation
    return throwError('Giovanni API not implemented yet');
  }

  /**
   * Search datasets using Earthdata Search API
   */
  searchDatasets(query: string, spatialBounds?: any): Observable<any> {
    const url = `${this.BASE_URLS.EARTHDATA_SEARCH}search`;
    const params = {
      q: query,
      ...(spatialBounds && { spatial: spatialBounds })
    };

    return this.http.get(url, { params }).pipe(
      catchError(error => this.handleApiError(error, 'Earthdata Search'))
    );
  }

  /**
   * Build time constraint for OPeNDAP queries
   */
  private buildTimeConstraint(dateRange: DateRange): string {
    const startDate = dateRange.startDate.toISOString().split('T')[0];
    const endDate = dateRange.endDate.toISOString().split('T')[0];
    return `time[0:1:${this.getTimeIndex(dateRange.endDate)}]`;
  }

  /**
   * Build spatial constraint for OPeNDAP queries
   */
  private buildSpatialConstraint(location: Location): string {
    const lat = location.latitude;
    const lon = location.longitude;
    const tolerance = 0.1; // 0.1 degree tolerance
    
    return `lat[${lat - tolerance}:${lat + tolerance}],lon[${lon - tolerance}:${lon + tolerance}]`;
  }

  /**
   * Get time index for OPeNDAP queries
   */
  private getTimeIndex(date: Date): number {
    // This would calculate the appropriate time index based on the dataset's temporal resolution
    // For MERRA-2, this would be based on the number of hours since the dataset start date
    const datasetStartDate = new Date('1980-01-01');
    const hoursDiff = (date.getTime() - datasetStartDate.getTime()) / (1000 * 60 * 60);
    return Math.floor(hoursDiff);
  }

  /**
   * Parse GES DISC response
   */
  private parseGesDiscResponse(response: any, variable: WeatherVariable): NasaApiResponse {
    // This would parse the actual OPeNDAP response
    // For now, return a mock response structure
    return {
      success: true,
      data: [],
      metadata: {
        dataset: 'MERRA-2',
        variable: variable.nasaVariable || variable.id,
        timeRange: '2020-01-01 to 2020-12-31',
        spatialCoverage: 'Global',
        units: variable.unit,
        source: 'GES DISC OPeNDAP'
      }
    };
  }

  /**
   * Handle API errors
   */
  private handleApiError(error: any, source: string): Observable<never> {
    console.error(`Error from ${source}:`, error);
    return throwError(`Failed to fetch data from ${source}: ${error.message}`);
  }

  /**
   * Generate mock weather data for testing
   */
  private getMockWeatherData(
    location: Location,
    variable: WeatherVariable,
    dateRange: DateRange
  ): Observable<NasaApiResponse> {
    // Simulate API delay
    return of(null).pipe(
      delay(1000),
      map(() => {
        const dataPoints = this.generateMockDataPoints(location, variable, dateRange);
        
        return {
          success: true,
          data: dataPoints,
          metadata: {
            dataset: 'MERRA-2',
            variable: variable.nasaVariable || variable.id,
            timeRange: `${dateRange.startDate.toISOString().split('T')[0]} to ${dateRange.endDate.toISOString().split('T')[0]}`,
            spatialCoverage: `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`,
            units: variable.unit,
            source: 'NASA MERRA-2 (Mock Data)'
          }
        };
      })
    );
  }

  /**
   * Generate mock data points
   */
  private generateMockDataPoints(
    location: Location,
    variable: WeatherVariable,
    dateRange: DateRange
  ): WeatherDataPoint[] {
    const dataPoints: WeatherDataPoint[] = [];
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    // Generate daily data points
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const value = this.generateMockValue(variable, date);
      
      dataPoints.push({
        date: new Date(date),
        value: Math.round(value * 100) / 100,
        unit: variable.unit,
        variable: variable.name,
        location,
        source: 'NASA MERRA-2',
        quality: 0.95
      });
    }

    return dataPoints;
  }

  /**
   * Generate realistic mock values based on variable type and season
   */
  private generateMockValue(variable: WeatherVariable, date: Date): number {
    const month = date.getMonth();
    const random = Math.random();
    
    switch (variable.category) {
      case 'temperature':
        // Seasonal temperature variation
        const baseTemp = 15 + Math.sin((month / 12) * 2 * Math.PI) * 15;
        return baseTemp + (random - 0.5) * 10;
        
      case 'precipitation':
        // Higher precipitation in certain months
        const seasonalFactor = month >= 4 && month <= 9 ? 1.5 : 0.8;
        return random < 0.3 ? (random * 20 * seasonalFactor) : 0;
        
      case 'wind':
        // Wind speed with seasonal variation
        const baseWind = 5 + Math.sin((month / 12) * 2 * Math.PI) * 2;
        return baseWind + (random - 0.5) * 4;
        
      case 'cloud':
        // Cloud cover percentage
        return 30 + random * 50;
        
      case 'humidity':
        // Relative humidity
        return 40 + random * 40;
        
      default:
        return random * 100;
    }
  }

  /**
   * Get available datasets for a variable
   */
  getAvailableDatasets(variable: WeatherVariable): Observable<string[]> {
    // Return available NASA datasets for the given variable
    const datasets = ['MERRA-2', 'GPM', 'MODIS', 'VIIRS'];
    return of(datasets);
  }

  /**
   * Get dataset metadata
   */
  getDatasetMetadata(dataset: string): Observable<any> {
    // Return metadata for the specified dataset
    const metadata = {
      'MERRA-2': {
        name: 'Modern-Era Retrospective analysis for Research and Applications, Version 2',
        resolution: '0.5° x 0.625°',
        temporalResolution: 'Hourly',
        variables: ['Temperature', 'Precipitation', 'Wind', 'Humidity', 'Pressure']
      },
      'GPM': {
        name: 'Global Precipitation Measurement',
        resolution: '0.1° x 0.1°',
        temporalResolution: '30 minutes',
        variables: ['Precipitation']
      }
    };

    // Create a type from the keys of the metadata object
    type DatasetKey = keyof typeof metadata;

    if (dataset in metadata) {
      // Use type assertion to inform TypeScript that dataset is a valid key
      return of(metadata[dataset as DatasetKey]);
    }

    // Fallback if dataset key is invalid
    return of({});
  }
}

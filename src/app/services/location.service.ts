import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Location } from '../models/weather-data.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private currentLocationSubject = new BehaviorSubject<Location | null>(null);
  private selectedLocationSubject = new BehaviorSubject<Location | null>(null);

  public currentLocation$ = this.currentLocationSubject.asObservable();
  public selectedLocation$ = this.selectedLocationSubject.asObservable();

  constructor() {
    this.getCurrentPosition();
  }

  /**
   * Get user's current position
   */
  getCurrentPosition(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            name: 'Current Location'
          };
          this.currentLocationSubject.next(location);
        },
        (error) => {
          console.error('Error getting current position:', error);
          // Set default location (New York City)
          const defaultLocation: Location = {
            latitude: 40.7128,
            longitude: -74.0060,
            name: 'New York City, NY'
          };
          this.currentLocationSubject.next(defaultLocation);
        }
      );
    } else {
      // Set default location if geolocation is not supported
      const defaultLocation: Location = {
        latitude: 40.7128,
        longitude: -74.0060,
        name: 'New York City, NY'
      };
      this.currentLocationSubject.next(defaultLocation);
    }
  }

  /**
   * Set selected location
   */
  setSelectedLocation(location: Location): void {
    this.selectedLocationSubject.next(location);
  }

  /**
   * Get location from coordinates
   */
  getLocationFromCoordinates(latitude: number, longitude: number): Observable<Location> {
    // In a real implementation, this would use a geocoding service
    // For now, we'll return a basic location object
    const location: Location = {
      latitude,
      longitude,
      name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    };
    return of(location);
  }

  /**
   * Search for locations by name
   */
  searchLocations(query: string): Observable<Location[]> {
    // In a real implementation, this would use a geocoding API
    // For now, we'll return some sample locations
    const sampleLocations: Location[] = [
      {
        latitude: 40.7128,
        longitude: -74.0060,
        name: 'New York City, NY',
        country: 'USA',
        state: 'NY'
      },
      {
        latitude: 34.0522,
        longitude: -118.2437,
        name: 'Los Angeles, CA',
        country: 'USA',
        state: 'CA'
      },
      {
        latitude: 41.8781,
        longitude: -87.6298,
        name: 'Chicago, IL',
        country: 'USA',
        state: 'IL'
      },
      {
        latitude: 29.7604,
        longitude: -95.3698,
        name: 'Houston, TX',
        country: 'USA',
        state: 'TX'
      },
      {
        latitude: 25.7617,
        longitude: -80.1918,
        name: 'Miami, FL',
        country: 'USA',
        state: 'FL'
      },
      {
        latitude: 51.5074,
        longitude: -0.1278,
        name: 'London, UK',
        country: 'UK'
      },
      {
        latitude: 48.8566,
        longitude: 2.3522,
        name: 'Paris, France',
        country: 'France'
      },
      {
        latitude: 35.6762,
        longitude: 139.6503,
        name: 'Tokyo, Japan',
        country: 'Japan'
      }
    ];

    const filteredLocations = sampleLocations.filter(location =>
      location.name.toLowerCase().includes(query.toLowerCase())
    );

    return of(filteredLocations);
  }

  /**
   * Validate coordinates
   */
  validateCoordinates(latitude: number, longitude: number): boolean {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  /**
   * Calculate distance between two locations (in kilometers)
   */
  calculateDistance(location1: Location, location2: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(location2.latitude - location1.latitude);
    const dLon = this.deg2rad(location2.longitude - location1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(location1.latitude)) * Math.cos(this.deg2rad(location2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Get current selected location
   */
  getCurrentSelectedLocation(): Location | null {
    return this.selectedLocationSubject.value;
  }

  /**
   * Clear selected location
   */
  clearSelectedLocation(): void {
    this.selectedLocationSubject.next(null);
  }
}

import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { Location } from '../../models/weather-data.model';
import { BehaviorSubject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

declare var L: any;

@Component({
  selector: 'app-location-selector',
  templateUrl: './location-selector.page.html',
  styleUrls: ['./location-selector.page.scss'],
})
export class LocationSelectorPage implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  searchQuery = '';
  searchResults: Location[] = [];
  selectedLocation: Location | null = null;
  isLoading = false;
  showMap = false;
  map: any;
  marker: any;
  
  // Coordinate input
  latitude = '';
  longitude = '';
  
  // Search subject for debounced search
  private searchSubject = new BehaviorSubject<string>('');

  constructor(
    private router: Router,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length >= 2) {
          return this.locationService.searchLocations(query);
        }
        return [];
      })
    ).subscribe(results => {
      this.searchResults = results;
    });

    // Load current location as default
    this.locationService.currentLocation$.subscribe(location => {
      if (location && !this.selectedLocation) {
        this.selectedLocation = location;
        this.latitude = location.latitude.toString();
        this.longitude = location.longitude.toString();
      }
    });
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  onSearchInput(event: any) {
    const query = event.target.value;
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  selectLocationFromSearch(location: Location) {
    this.selectedLocation = location;
    this.latitude = location.latitude.toString();
    this.longitude = location.longitude.toString();
    this.searchQuery = location.name;
    this.searchResults = [];
    
    // Update map if it's visible
    if (this.showMap && this.map) {
      this.updateMapLocation(location);
    }
  }

  toggleMap() {
    this.showMap = !this.showMap;
    if (this.showMap) {
      setTimeout(() => this.initializeMap(), 100);
    }
  }

  initializeMap() {
    if (!this.mapContainer?.nativeElement) return;

    // Initialize map
    this.map = L.map(this.mapContainer.nativeElement).setView([40.7128, -74.0060], 10);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add click handler
    this.map.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      this.latitude = lat.toFixed(6);
      this.longitude = lng.toFixed(6);
      
      // Create or update marker
      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      } else {
        this.marker = L.marker([lat, lng]).addTo(this.map);
      }
      
      // Update selected location
      this.selectedLocation = {
        latitude: lat,
        longitude: lng,
        name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      };
    });

    // If we have a selected location, center the map on it
    if (this.selectedLocation) {
      this.updateMapLocation(this.selectedLocation);
    }
  }

  updateMapLocation(location: Location) {
    if (!this.map) return;
    
    this.map.setView([location.latitude, location.longitude], 10);
    
    if (this.marker) {
      this.marker.setLatLng([location.latitude, location.longitude]);
    } else {
      this.marker = L.marker([location.latitude, location.longitude]).addTo(this.map);
    }
  }

  onCoordinateInput() {
    const lat = parseFloat(this.latitude);
    const lon = parseFloat(this.longitude);
    
    if (this.locationService.validateCoordinates(lat, lon)) {
      this.selectedLocation = {
        latitude: lat,
        longitude: lon,
        name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`
      };
      
      // Update map if it's visible
      if (this.showMap && this.map) {
        this.updateMapLocation(this.selectedLocation);
      }
    }
  }

  useCurrentLocation() {
    this.isLoading = true;
    this.locationService.getCurrentPosition();
    
    this.locationService.currentLocation$.subscribe(location => {
      if (location) {
        this.selectedLocation = location;
        this.latitude = location.latitude.toString();
        this.longitude = location.longitude.toString();
        this.searchQuery = location.name;
        
        if (this.showMap && this.map) {
          this.updateMapLocation(location);
        }
      }
      this.isLoading = false;
    });
  }

  continueToVariables() {
    if (this.selectedLocation) {
      this.locationService.setSelectedLocation(this.selectedLocation);
      this.router.navigate(['/variables']);
    }
  }

  goBack() {
    this.router.navigate(['/weather/tabs/explore']);
  }

  isLocationValid(): boolean {
    return this.selectedLocation !== null;
  }

  getLocationDisplayName(): string {
    if (this.selectedLocation) {
      return this.selectedLocation.name;
    }
    return 'No location selected';
  }
}

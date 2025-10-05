import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { WeatherDataService } from '../../services/weather-data.service';
import { Location } from '../../models/weather-data.model';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonIcon, 
  IonButton, 
  IonSpinner
} from '@ionic/angular/standalone';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-weather-explore',
  templateUrl: './weather-explore.page.html',
  styleUrls: ['./weather-explore.page.scss'],
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardContent, 
    IonIcon, 
    IonButton, 
    IonSpinner,
    CommonModule,
    FormsModule,
    DecimalPipe
  ],
  standalone: true
})
export class WeatherExplorePage implements OnInit {
  currentLocation: Location | null = null;
  selectedLocation: Location | null = null;
  isLoading = false;

  constructor(
    private router: Router,
    private locationService: LocationService,
    private weatherDataService: WeatherDataService
  ) {}

  ngOnInit() {
    this.locationService.currentLocation$.subscribe(location => {
      this.currentLocation = location;
    });

    this.locationService.selectedLocation$.subscribe(location => {
      this.selectedLocation = location;
    });
  }

  startWeatherExploration() {
    this.router.navigate(['/location']);
  }

  continueWithCurrentLocation() {
    if (this.currentLocation) {
      this.locationService.setSelectedLocation(this.currentLocation);
      this.router.navigate(['/variables']);
    }
  }

  viewWeatherHistory() {
    this.router.navigate(['/weather/tabs/history']);
  }

  getLocationDisplayName(): string {
    if (this.selectedLocation) {
      return this.selectedLocation.name;
    }
    if (this.currentLocation) {
      return this.currentLocation.name;
    }
    return 'No location selected';
  }
}

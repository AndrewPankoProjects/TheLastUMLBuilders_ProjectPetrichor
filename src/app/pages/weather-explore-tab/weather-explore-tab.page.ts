import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalysisStateService } from '../../services/analysis-state.service';
import { LocationService } from '../../services/location.service';
import { WeatherDataService } from '../../services/weather-data.service';
import { Location, WeatherVariable, DateRange } from '../../models/weather-data.model';
import { AVAILABLE_WEATHER_VARIABLES } from '../../models/weather-variables';

@Component({
  selector: 'app-weather-explore-tab',
  templateUrl: './weather-explore-tab.page.html',
  styleUrls: ['./weather-explore-tab.page.scss'],
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    CommonModule,
    FormsModule
  ],
  standalone: true
})
export class WeatherExploreTabPage {
  selectedLocation = 'New York City';
  selectedVariable = 'temp_avg';
  selectedDateRange = 'last-year';
  
  weatherVariables = AVAILABLE_WEATHER_VARIABLES;

  dateRanges = [
    { value: 'last-month', label: 'Last Month' },
    { value: 'last-year', label: 'Last Year' },
    { value: 'last-5-years', label: 'Last 5 Years' },
    { value: 'future-prediction', label: 'Future Prediction (Next Year)' }
  ];

  constructor(
    private router: Router,
    private analysisStateService: AnalysisStateService,
    private locationService: LocationService,
    private weatherDataService: WeatherDataService
  ) {}

  async startAnalysis() {
    try {
      // Get the selected weather variable
      const variable = this.weatherVariables.find(v => v.id === this.selectedVariable);
      if (!variable) {
        console.error('Selected variable not found');
        return;
      }

      // Create location object
      const location: Location = {
        latitude: this.getLocationCoordinates(this.selectedLocation).lat,
        longitude: this.getLocationCoordinates(this.selectedLocation).lng,
        name: this.selectedLocation
      };

      // Create date range
      const dateRange = this.createDateRange(this.selectedDateRange);

      // Set selections in the analysis state service
      this.analysisStateService.setSelectedLocation(location);
      this.analysisStateService.setSelectedVariable(variable);
      this.analysisStateService.setSelectedDateRange(dateRange);

      // Navigate to dashboard
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error starting analysis:', error);
    }
  }

  private getLocationCoordinates(locationName: string): { lat: number, lng: number } {
    const coordinates: { [key: string]: { lat: number, lng: number } } = {
      'New York City': { lat: 40.7128, lng: -74.0060 },
      'Los Angeles': { lat: 34.0522, lng: -118.2437 },
      'Chicago': { lat: 41.8781, lng: -87.6298 },
      'Houston': { lat: 29.7604, lng: -95.3698 },
      'Phoenix': { lat: 33.4484, lng: -112.0740 },
      'Philadelphia': { lat: 39.9526, lng: -75.1652 },
      'San Antonio': { lat: 29.4241, lng: -98.4936 },
      'San Diego': { lat: 32.7157, lng: -117.1611 },
      'Dallas': { lat: 32.7767, lng: -96.7970 },
      'San Jose': { lat: 37.3382, lng: -121.8863 }
    };
    return coordinates[locationName] || coordinates['New York City'];
  }

  private createDateRange(rangeType: string): DateRange {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (rangeType) {
      case 'last-month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        endDate = new Date(today);
        break;
      case 'last-year':
        startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        endDate = new Date(today);
        break;
      case 'last-5-years':
        startDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
        endDate = new Date(today);
        break;
      case 'future-prediction':
        startDate = new Date(today);
        endDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        break;
      default:
        startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        endDate = new Date(today);
    }

    return {
      startDate,
      endDate,
      isSeasonal: false
    };
  }

  isReadyForAnalysis(): boolean {
    return !!(this.selectedLocation && this.selectedVariable && this.selectedDateRange);
  }
}
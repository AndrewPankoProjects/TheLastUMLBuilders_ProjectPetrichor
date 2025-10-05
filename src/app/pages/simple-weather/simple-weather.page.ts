import { Component } from '@angular/core';
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
  IonIcon
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simple-weather',
  templateUrl: './simple-weather.page.html',
  styleUrls: ['./simple-weather.page.scss'],
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
    CommonModule
  ],
  standalone: true
})
export class SimpleWeatherPage {
  weatherData = {
    location: 'New York City',
    temperature: 22.5,
    humidity: 65,
    windSpeed: 12.3,
    precipitation: 0.0
  };

  constructor() {}

  generateSampleData() {
    // Generate random weather data
    this.weatherData.temperature = Math.round((Math.random() * 30 + 5) * 10) / 10;
    this.weatherData.humidity = Math.round(Math.random() * 40 + 40);
    this.weatherData.windSpeed = Math.round((Math.random() * 15 + 2) * 10) / 10;
    this.weatherData.precipitation = Math.round(Math.random() * 5 * 10) / 10;
  }
}

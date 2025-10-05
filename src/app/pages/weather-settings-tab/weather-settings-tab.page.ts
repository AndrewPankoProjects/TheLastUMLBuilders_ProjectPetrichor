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
  IonIcon,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonSegment,
  IonSegmentButton
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-weather-settings-tab',
  templateUrl: './weather-settings-tab.page.html',
  styleUrls: ['./weather-settings-tab.page.scss'],
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
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonSegment,
    IonSegmentButton,
    CommonModule,
    FormsModule
  ],
  standalone: true
})
export class WeatherSettingsTabPage {
  settings = {
    units: 'metric',
    theme: 'light',
    notifications: true,
    autoLocation: true,
    dataSource: 'nasa',
    language: 'en',
    cacheSize: 'medium'
  };

  constructor() {}

  onSettingChange() {
    console.log('Settings updated:', this.settings);
    // In a real app, this would save to storage
  }

  resetSettings() {
    this.settings = {
      units: 'metric',
      theme: 'light',
      notifications: true,
      autoLocation: true,
      dataSource: 'nasa',
      language: 'en',
      cacheSize: 'medium'
    };
    this.onSettingChange();
  }

  exportSettings() {
    const settingsJson = JSON.stringify(this.settings, null, 2);
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'weather-explorer-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  getAppVersion(): string {
    return '1.0.0';
  }

  getDataUsage(): string {
    return '2.3 MB';
  }
}

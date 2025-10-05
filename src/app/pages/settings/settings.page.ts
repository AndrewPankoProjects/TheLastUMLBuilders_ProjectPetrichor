import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  settings = {
    units: 'metric',
    theme: 'light',
    notifications: true,
    autoLocation: true,
    dataSource: 'nasa'
  };

  constructor() {}

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    // In a real app, this would load from storage
    // For now, we'll use default values
  }

  saveSettings() {
    // In a real app, this would save to storage
    console.log('Settings saved:', this.settings);
  }

  onSettingChange() {
    this.saveSettings();
  }

  resetSettings() {
    this.settings = {
      units: 'metric',
      theme: 'light',
      notifications: true,
      autoLocation: true,
      dataSource: 'nasa'
    };
    this.saveSettings();
  }
}

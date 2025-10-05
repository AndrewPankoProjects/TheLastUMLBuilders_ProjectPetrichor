import { Component, OnInit } from '@angular/core';
import { WeatherDataService } from '../../services/weather-data.service';
import { WeatherAnalysis } from '../../models/weather-data.model';

@Component({
  selector: 'app-weather-history',
  templateUrl: './weather-history.page.html',
  styleUrls: ['./weather-history.page.scss'],
})
export class WeatherHistoryPage implements OnInit {
  analysisHistory: WeatherAnalysis[] = [];
  isLoading = false;

  constructor(private weatherDataService: WeatherDataService) {}

  ngOnInit() {
    this.loadAnalysisHistory();
  }

  loadAnalysisHistory() {
    this.isLoading = true;
    // In a real app, this would load from a service or local storage
    // For now, we'll show a placeholder
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  clearHistory() {
    this.analysisHistory = [];
    // In a real app, this would clear from storage
  }

  getHistoryCount(): number {
    return this.analysisHistory.length;
  }
}

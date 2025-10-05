import { Component, OnInit } from '@angular/core';
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
  IonChip,
  IonList
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AnalysisStateService } from '../../services/analysis-state.service';
import { WeatherAnalysis } from '../../models/weather-data.model';

@Component({
  selector: 'app-weather-history-tab',
  templateUrl: './weather-history-tab.page.html',
  styleUrls: ['./weather-history-tab.page.scss'],
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
    IonChip,
    IonList,
    CommonModule
  ],
  standalone: true
})
export class WeatherHistoryTabPage implements OnInit {
  analysisHistory: WeatherAnalysis[] = [];

  constructor(private analysisStateService: AnalysisStateService) {}

  ngOnInit() {
    this.analysisStateService.analysisHistory$.subscribe(history => {
      this.analysisHistory = history;
    });
  }

  getTotalAnalyses(): number {
    return this.analysisHistory.length;
  }

  getCompletedCount(): number {
    return this.analysisHistory.filter(a => a.status === 'completed').length;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'failed': return 'danger';
      default: return 'medium';
    }
  }

  viewAnalysis(analysis: WeatherAnalysis) {
    console.log('Viewing analysis:', analysis);
    // In a real app, this would navigate to a detailed view
  }

  deleteAnalysis(analysis: WeatherAnalysis) {
    console.log('Deleting analysis:', analysis);
    // In a real app, this would remove the analysis from history
  }

  clearAllHistory() {
    this.analysisStateService.clearHistory();
  }

  formatDateRange(dateRange: any): string {
    if (!dateRange) return 'Unknown';
    const start = new Date(dateRange.startDate).toLocaleDateString();
    const end = new Date(dateRange.endDate).toLocaleDateString();
    return `${start} - ${end}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getAverageValue(analysis: WeatherAnalysis): string {
    if (!analysis.statistics || !analysis.statistics.mean) return 'N/A';
    return `${analysis.statistics.mean.toFixed(1)} ${analysis.variable.unit}`;
  }
}
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { WeatherDataService } from '../../services/weather-data.service';
import { LocationService } from '../../services/location.service';
import { NasaApiService } from '../../services/nasa-api.service';
import { ChartService } from '../../services/chart.service';
import { AnalysisStateService } from '../../services/analysis-state.service';
import { WeatherAnalysis, WeatherVariable, Location, DateRange } from '../../models/weather-data.model';
import { AVAILABLE_WEATHER_VARIABLES } from '../../models/weather-variables';
import { ChartConfiguration, Chart } from 'chart.js';
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
  IonSpinner,
  IonButtons,
  IonBackButton,
  IonCheckbox,
  IonLabel,
  IonItem
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
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
    IonSpinner,
  IonButtons,
  IonBackButton,
  IonCheckbox,
  IonLabel,
  IonItem,
    CommonModule,
    FormsModule
  ],
  standalone: true
})
export class DashboardPage implements OnInit, OnDestroy {
  @ViewChild('timeSeriesChart', { static: false }) timeSeriesChartRef!: ElementRef;
  @ViewChild('histogramChart', { static: false }) histogramChartRef!: ElementRef;
  @ViewChild('statisticsChart', { static: false }) statisticsChartRef!: ElementRef;
  @ViewChild('probabilityChart', { static: false }) probabilityChartRef!: ElementRef;

  selectedLocation: Location | null = null;
  selectedVariables: WeatherVariable[] = [];
  selectedDateRange: DateRange | null = null;
  currentAnalysis: WeatherAnalysis | null = null;
  isLoading = false;
  error: string | null = null;
  
  // Chart instances
  timeSeriesChart: any = null;
  histogramChart: any = null;
  statisticsChart: any = null;
  probabilityChart: any = null;
  
  // Chart visibility
  showTimeSeries = true;
  showHistogram = true;
  showStatistics = true;
  showProbability = true;

  constructor(
    private router: Router,
    private weatherDataService: WeatherDataService,
    private locationService: LocationService,
    private nasaApiService: NasaApiService,
    private chartService: ChartService,
    private analysisStateService: AnalysisStateService
  ) {}

  ngOnInit() {
    this.loadUserSelections();
    this.generateAnalysis();
  }

  ngOnDestroy() {
    this.destroyCharts();
  }

  loadUserSelections() {
    this.analysisStateService.selectedLocation$.subscribe(location => {
      this.selectedLocation = location;
    });
    
    this.analysisStateService.selectedVariable$.subscribe(variable => {
      if (variable) {
        this.selectedVariables = [variable];
      }
    });
    
    this.analysisStateService.selectedDateRange$.subscribe(dateRange => {
      this.selectedDateRange = dateRange;
    });
  }

  async generateAnalysis() {
    if (!this.selectedLocation || !this.selectedVariables.length || !this.selectedDateRange) {
      this.error = 'Missing required selections. Please go back and complete all steps.';
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      // For the first variable, generate analysis
      const variable = this.selectedVariables[0];
      
      // Get data from NASA API
      const nasaResponse = await this.nasaApiService.getWeatherData(
        this.selectedLocation,
        variable,
        this.selectedDateRange
      ).toPromise();

      if (nasaResponse && nasaResponse.success) {
        // Create analysis
        const analysis = this.weatherDataService.createAnalysis(
          variable,
          this.selectedLocation,
          this.selectedDateRange,
          nasaResponse.data
        );

        this.currentAnalysis = analysis;
        this.weatherDataService.setCurrentAnalysis(analysis);
        this.analysisStateService.setCurrentAnalysis(analysis);
        
        // Generate charts
        setTimeout(() => this.generateCharts(), 100);
      } else {
        throw new Error('Failed to retrieve data from NASA API');
      }
    } catch (error) {
      this.error = `Error generating analysis: ${error}`;
      console.error('Analysis error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  generateCharts() {
    if (!this.currentAnalysis) return;

    try {
      // Time Series Chart
      if (this.showTimeSeries && this.timeSeriesChartRef) {
        const timeSeriesConfig = this.chartService.createTimeSeriesChart(this.currentAnalysis);
        this.createChart('timeSeriesChart', timeSeriesConfig);
      }

      // Histogram Chart
      if (this.showHistogram && this.histogramChartRef) {
        const histogramConfig = this.chartService.createHistogramChart(this.currentAnalysis);
        this.createChart('histogramChart', histogramConfig);
      }

      // Statistics Chart
      if (this.showStatistics && this.statisticsChartRef) {
        const statisticsConfig = this.chartService.createStatisticsChart(this.currentAnalysis);
        this.createChart('statisticsChart', statisticsConfig);
      }

      // Probability Chart
      if (this.showProbability && this.probabilityChartRef && this.currentAnalysis.probability) {
        const probabilityConfig = this.chartService.createProbabilityChart(this.currentAnalysis);
        this.createChart('probabilityChart', probabilityConfig);
      }
    } catch (error) {
      console.error('Chart generation error:', error);
    }
  }

  createChart(chartType: string, config: ChartConfiguration) {
    let canvasElement: HTMLCanvasElement | null = null;
    let chartInstance: Chart | null = null;

    switch (chartType) {
      case 'timeSeriesChart':
        canvasElement = this.timeSeriesChartRef?.nativeElement?.querySelector('canvas');
        chartInstance = this.timeSeriesChart;
        break;
      case 'histogramChart':
        canvasElement = this.histogramChartRef?.nativeElement?.querySelector('canvas');
        chartInstance = this.histogramChart;
        break;
      case 'statisticsChart':
        canvasElement = this.statisticsChartRef?.nativeElement?.querySelector('canvas');
        chartInstance = this.statisticsChart;
        break;
      case 'probabilityChart':
        canvasElement = this.probabilityChartRef?.nativeElement?.querySelector('canvas');
        chartInstance = this.probabilityChart;
        break;
    }

    if (canvasElement) {
      // Destroy existing chart if it exists
      if (chartInstance) {
        chartInstance.destroy();
      }

      // Create new chart
      const ctx = canvasElement.getContext('2d');
      if (ctx) {
        const newChart = new Chart(ctx, config);
        
        // Store reference to the chart
        switch (chartType) {
          case 'timeSeriesChart':
            this.timeSeriesChart = newChart;
            break;
          case 'histogramChart':
            this.histogramChart = newChart;
            break;
          case 'statisticsChart':
            this.statisticsChart = newChart;
            break;
          case 'probabilityChart':
            this.probabilityChart = newChart;
            break;
        }
      }
    }
  }

  destroyCharts() {
    if (this.timeSeriesChart) {
      this.timeSeriesChart.destroy();
      this.timeSeriesChart = null;
    }
    if (this.histogramChart) {
      this.histogramChart.destroy();
      this.histogramChart = null;
    }
    if (this.statisticsChart) {
      this.statisticsChart.destroy();
      this.statisticsChart = null;
    }
    if (this.probabilityChart) {
      this.probabilityChart.destroy();
      this.probabilityChart = null;
    }
  }

  toggleChart(chartType: string) {
    switch (chartType) {
      case 'timeSeries':
        this.showTimeSeries = !this.showTimeSeries;
        break;
      case 'histogram':
        this.showHistogram = !this.showHistogram;
        break;
      case 'statistics':
        this.showStatistics = !this.showStatistics;
        break;
      case 'probability':
        this.showProbability = !this.showProbability;
        break;
    }
    
    // Regenerate charts
    setTimeout(() => this.generateCharts(), 100);
  }

  exportData(format: 'csv' | 'json' | 'png') {
    if (!this.currentAnalysis) return;

    switch (format) {
      case 'csv':
        this.exportAsCSV();
        break;
      case 'json':
        this.exportAsJSON();
        break;
      case 'png':
        this.exportAsPNG();
        break;
    }
  }

  exportAsCSV() {
    if (!this.currentAnalysis) return;

    const headers = ['Date', 'Value', 'Unit', 'Variable', 'Location'];
    const rows = this.currentAnalysis.dataPoints.map(point => [
      point.date.toISOString().split('T')[0],
      point.value,
      point.unit,
      point.variable,
      point.location.name
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    this.downloadFile(csvContent, 'weather-analysis.csv', 'text/csv');
  }

  exportAsJSON() {
    if (!this.currentAnalysis) return;

    const jsonContent = JSON.stringify(this.currentAnalysis, null, 2);
    this.downloadFile(jsonContent, 'weather-analysis.json', 'application/json');
  }

  exportAsPNG() {
    // This would export the charts as PNG images
    console.log('Exporting charts as PNG...');
  }

  downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  startNewAnalysis() {
    this.router.navigate(['/weather/tabs/explore']);
  }

  goBack() {
    this.router.navigate(['/date-range']);
  }

  getAnalysisSummary(): string {
    if (!this.currentAnalysis) return 'No analysis available';

    const stats = this.currentAnalysis.statistics;
    const variable = this.currentAnalysis.variable;
    
    return `Average ${variable.name.toLowerCase()}: ${stats.mean.toFixed(1)} ${variable.unit}. ` +
           `Range: ${stats.min.toFixed(1)} - ${stats.max.toFixed(1)} ${variable.unit}. ` +
           `Based on ${this.currentAnalysis.dataPoints.length} data points.`;
  }

  getTrendSummary(): string {
    if (!this.currentAnalysis?.trends) return 'No trend data available';

    const trends = this.currentAnalysis.trends;
    const direction = trends.direction === 'increasing' ? 'increasing' : 
                     trends.direction === 'decreasing' ? 'decreasing' : 'stable';
    
    return `Trend: ${direction} (${trends.rate.toFixed(3)} ${this.currentAnalysis.variable.unit}/day). ` +
           `Significance: ${(trends.significance * 100).toFixed(1)}%`;
  }

  getProbabilitySummary(): string {
    if (!this.currentAnalysis?.probability) return 'No probability data available';

    const prob = this.currentAnalysis.probability;
    return `${prob.description}`;
  }
}

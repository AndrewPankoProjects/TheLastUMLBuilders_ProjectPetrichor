import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { WeatherAnalysis, WeatherDataPoint, WeatherVariable, Location, DateRange, QueryParameters } from '../models/weather-data.model';
import { AVAILABLE_WEATHER_VARIABLES } from '../models/weather-variables';

@Injectable({
  providedIn: 'root'
})
export class WeatherDataService {
  private currentAnalysisSubject = new BehaviorSubject<WeatherAnalysis | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public currentAnalysis$ = this.currentAnalysisSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor() {}

  /**
   * Get available weather variables
   */
  getAvailableVariables(): WeatherVariable[] {
    return AVAILABLE_WEATHER_VARIABLES;
  }

  /**
   * Get variables by category
   */
  getVariablesByCategory(category: string): WeatherVariable[] {
    return AVAILABLE_WEATHER_VARIABLES.filter(variable => variable.category === category);
  }

  /**
   * Calculate statistics for weather data
   */
  calculateStatistics(dataPoints: WeatherDataPoint[]): WeatherAnalysis['statistics'] {
    if (dataPoints.length === 0) {
      return {
        mean: 0,
        median: 0,
        min: 0,
        max: 0,
        standardDeviation: 0,
        percentile25: 0,
        percentile75: 0
      };
    }

    const values = dataPoints.map(point => point.value).sort((a, b) => a - b);
    const n = values.length;

    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const median = n % 2 === 0 
      ? (values[n / 2 - 1] + values[n / 2]) / 2 
      : values[Math.floor(n / 2)];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const standardDeviation = Math.sqrt(variance);
    
    const percentile25 = values[Math.floor(n * 0.25)];
    const percentile75 = values[Math.floor(n * 0.75)];

    return {
      mean,
      median,
      min,
      max,
      standardDeviation,
      percentile25,
      percentile75
    };
  }

  /**
   * Calculate probability of extreme weather conditions
   */
  calculateProbability(dataPoints: WeatherDataPoint[], condition: string): WeatherAnalysis['probability'] {
    if (dataPoints.length === 0) {
      return {
        condition: '',
        probability: 0,
        description: 'No data available'
      };
    }

    const values = dataPoints.map(point => point.value);
    const totalDays = values.length;

    // Example conditions - can be expanded
    let threshold: number;
    let conditionName: string;

    switch (condition) {
      case 'high_temp':
        threshold = 30; // 30°C
        conditionName = 'Temperature > 30°C';
        break;
      case 'heavy_rain':
        threshold = 10; // 10mm
        conditionName = 'Rainfall > 10mm';
        break;
      case 'strong_wind':
        threshold = 10; // 10 m/s
        conditionName = 'Wind Speed > 10 m/s';
        break;
      default:
        threshold = 0;
        conditionName = 'Unknown condition';
    }

    const extremeDays = values.filter(val => val > threshold).length;
    const probability = (extremeDays / totalDays) * 100;

    return {
      condition: conditionName,
      probability: Math.round(probability * 10) / 10,
      description: `Based on ${totalDays} days of data, there is a ${Math.round(probability * 10) / 10}% chance of ${conditionName.toLowerCase()}`
    };
  }

  /**
   * Detect trends in weather data
   */
  detectTrends(dataPoints: WeatherDataPoint[]): WeatherAnalysis['trends'] {
    if (dataPoints.length < 2) {
      return {
        direction: 'stable',
        rate: 0,
        significance: 0
      };
    }

    // Simple linear regression to detect trend
    const sortedData = dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
    const n = sortedData.length;
    const x = sortedData.map((_, index) => index);
    const y = sortedData.map(point => point.value);

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, index) => sum + val * y[index], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared for significance
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, val, index) => {
      const predicted = slope * x[index] + intercept;
      return sum + Math.pow(val - predicted, 2);
    }, 0);
    const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);

    return {
      direction: slope > 0.01 ? 'increasing' : slope < -0.01 ? 'decreasing' : 'stable',
      rate: Math.round(slope * 1000) / 1000, // Round to 3 decimal places
      significance: Math.round(rSquared * 100) / 100
    };
  }

  /**
   * Create weather analysis from data points
   */
  createAnalysis(
    variable: WeatherVariable,
    location: Location,
    dateRange: DateRange,
    dataPoints: WeatherDataPoint[]
  ): WeatherAnalysis {
    const statistics = this.calculateStatistics(dataPoints);
    const probability = this.calculateProbability(dataPoints, this.getConditionKey(variable));
    const trends = this.detectTrends(dataPoints);

    return {
      id: this.generateAnalysisId(),
      variable,
      location,
      dateRange,
      dataPoints,
      statistics,
      probability,
      trends,
      status: 'completed',
      createdAt: new Date()
    };
  }

  /**
   * Generate unique analysis ID
   */
  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get condition key for probability calculation
   */
  private getConditionKey(variable: WeatherVariable): string {
    switch (variable.category) {
      case 'temperature':
        return 'high_temp';
      case 'precipitation':
        return 'heavy_rain';
      case 'wind':
        return 'strong_wind';
      default:
        return 'unknown';
    }
  }

  /**
   * Set current analysis
   */
  setCurrentAnalysis(analysis: WeatherAnalysis): void {
    this.currentAnalysisSubject.next(analysis);
  }

  /**
   * Clear current analysis
   */
  clearAnalysis(): void {
    this.currentAnalysisSubject.next(null);
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Set error message
   */
  setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  /**
   * Generate sample data for testing
   */
  generateSampleData(variable: WeatherVariable, location: Location, dateRange: DateRange): WeatherDataPoint[] {
    const dataPoints: WeatherDataPoint[] = [];
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    // Generate daily data points
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      // Generate realistic sample data based on variable type
      let value: number;
      const random = Math.random();
      
      switch (variable.category) {
        case 'temperature':
          value = 15 + (Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 15) + (random - 0.5) * 10;
          break;
        case 'precipitation':
          value = random < 0.3 ? (random * 20) : 0; // 30% chance of rain
          break;
        case 'wind':
          value = 3 + random * 8; // Wind speed 3-11 m/s
          break;
        case 'cloud':
          value = random * 100; // Cloud cover 0-100%
          break;
        case 'humidity':
          value = 40 + random * 40; // Humidity 40-80%
          break;
        default:
          value = random * 100;
      }

      dataPoints.push({
        date: new Date(date),
        value: Math.round(value * 10) / 10,
        unit: variable.unit,
        variable: variable.name,
        location,
        source: 'Sample Data',
        quality: 1.0
      });
    }

    return dataPoints;
  }
}

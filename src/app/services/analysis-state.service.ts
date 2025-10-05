import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WeatherAnalysis, Location, WeatherVariable, DateRange } from '../models/weather-data.model';

@Injectable({
  providedIn: 'root'
})
export class AnalysisStateService {
  private currentAnalysisSubject = new BehaviorSubject<WeatherAnalysis | null>(null);
  private analysisHistorySubject = new BehaviorSubject<WeatherAnalysis[]>([]);
  private selectedLocationSubject = new BehaviorSubject<Location | null>(null);
  private selectedVariableSubject = new BehaviorSubject<WeatherVariable | null>(null);
  private selectedDateRangeSubject = new BehaviorSubject<DateRange | null>(null);

  public currentAnalysis$ = this.currentAnalysisSubject.asObservable();
  public analysisHistory$ = this.analysisHistorySubject.asObservable();
  public selectedLocation$ = this.selectedLocationSubject.asObservable();
  public selectedVariable$ = this.selectedVariableSubject.asObservable();
  public selectedDateRange$ = this.selectedDateRangeSubject.asObservable();

  constructor() {
    this.loadHistoryFromStorage();
  }

  // Set analysis parameters
  setSelectedLocation(location: Location): void {
    this.selectedLocationSubject.next(location);
  }

  setSelectedVariable(variable: WeatherVariable): void {
    this.selectedVariableSubject.next(variable);
  }

  setSelectedDateRange(dateRange: DateRange): void {
    this.selectedDateRangeSubject.next(dateRange);
  }

  // Set current analysis
  setCurrentAnalysis(analysis: WeatherAnalysis): void {
    this.currentAnalysisSubject.next(analysis);
    this.addToHistory(analysis);
  }

  // Get current values
  getCurrentLocation(): Location | null {
    return this.selectedLocationSubject.value;
  }

  getCurrentVariable(): WeatherVariable | null {
    return this.selectedVariableSubject.value;
  }

  getCurrentDateRange(): DateRange | null {
    return this.selectedDateRangeSubject.value;
  }

  getCurrentAnalysis(): WeatherAnalysis | null {
    return this.currentAnalysisSubject.value;
  }

  // History management
  addToHistory(analysis: WeatherAnalysis): void {
    const currentHistory = this.analysisHistorySubject.value;
    const newHistory = [analysis, ...currentHistory.slice(0, 9)]; // Keep last 10 analyses
    this.analysisHistorySubject.next(newHistory);
    this.saveHistoryToStorage(newHistory);
  }

  clearHistory(): void {
    this.analysisHistorySubject.next([]);
    this.saveHistoryToStorage([]);
  }

  getAnalysisHistory(): WeatherAnalysis[] {
    return this.analysisHistorySubject.value;
  }

  // Storage management
  private saveHistoryToStorage(history: WeatherAnalysis[]): void {
    try {
      localStorage.setItem('weather-analysis-history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history to storage:', error);
    }
  }

  private loadHistoryFromStorage(): void {
    try {
      const stored = localStorage.getItem('weather-analysis-history');
      if (stored) {
        const history = JSON.parse(stored);
        this.analysisHistorySubject.next(history);
      }
    } catch (error) {
      console.error('Failed to load history from storage:', error);
    }
  }

  // Validation
  isReadyForAnalysis(): boolean {
    return !!(this.getCurrentLocation() && this.getCurrentVariable() && this.getCurrentDateRange());
  }

  // Clear all selections
  clearAllSelections(): void {
    this.selectedLocationSubject.next(null);
    this.selectedVariableSubject.next(null);
    this.selectedDateRangeSubject.next(null);
    this.currentAnalysisSubject.next(null);
  }
}

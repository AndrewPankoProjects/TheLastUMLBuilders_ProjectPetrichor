import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { DateRange } from '../../models/weather-data.model';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.page.html',
  styleUrls: ['./date-picker.page.scss'],
})
export class DatePickerPage implements OnInit {
  selectedLocation: any = null;
  selectedVariables: any[] = [];
  
  // Date selection mode
  selectionMode: 'custom' | 'seasonal' | 'preset' = 'custom';
  
  // Custom date range
  startDate: string = '';
  endDate: string = '';
  
  // Seasonal selection
  selectedSeason: 'spring' | 'summer' | 'fall' | 'winter' = 'spring';
  selectedYear: number = new Date().getFullYear();
  
  // Preset options
  presetRanges = [
    { id: 'last30days', name: 'Last 30 Days', days: 30 },
    { id: 'last90days', name: 'Last 90 Days', days: 90 },
    { id: 'lastyear', name: 'Last Year', days: 365 },
    { id: 'last2years', name: 'Last 2 Years', days: 730 },
    { id: 'last5years', name: 'Last 5 Years', days: 1825 }
  ];
  selectedPreset: string = '';

  constructor(
    private router: Router,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.locationService.selectedLocation$.subscribe(location => {
      this.selectedLocation = location;
    });
    
    // Set default dates (last year)
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    this.endDate = this.formatDate(today);
    this.startDate = this.formatDate(oneYearAgo);
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onSelectionModeChange(event: any) {
    this.selectionMode = event.detail.value;
    this.updateDateRange();
  }

  onCustomDateChange() {
    this.updateDateRange();
  }

  onSeasonChange(event: any) {
    this.selectedSeason = event.detail.value;
    this.updateDateRange();
  }

  onYearChange(event: any) {
    this.selectedYear = parseInt(event.detail.value);
    this.updateDateRange();
  }

  onPresetChange(event: any) {
    this.selectedPreset = event.detail.value;
    this.updateDateRange();
  }

  updateDateRange() {
    const today = new Date();
    
    switch (this.selectionMode) {
      case 'preset':
        this.updatePresetRange();
        break;
      case 'seasonal':
        this.updateSeasonalRange();
        break;
      case 'custom':
        // Custom dates are already set by user input
        break;
    }
  }

  updatePresetRange() {
    const preset = this.presetRanges.find(p => p.id === this.selectedPreset);
    if (preset) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - preset.days);
      
      this.endDate = this.formatDate(endDate);
      this.startDate = this.formatDate(startDate);
    }
  }

  updateSeasonalRange() {
    let startMonth: number, endMonth: number, startDay: number, endDay: number;
    
    switch (this.selectedSeason) {
      case 'spring':
        startMonth = 2; // March
        endMonth = 4;   // May
        startDay = 1;
        endDay = 31;
        break;
      case 'summer':
        startMonth = 5; // June
        endMonth = 7;   // August
        startDay = 1;
        endDay = 31;
        break;
      case 'fall':
        startMonth = 8; // September
        endMonth = 10;  // November
        startDay = 1;
        endDay = 30;
        break;
      case 'winter':
        startMonth = 11; // December
        endMonth = 1;    // February (next year)
        startDay = 1;
        endDay = 28; // February
        break;
    }
    
    const startDate = new Date(this.selectedYear, startMonth, startDay);
    const endDate = new Date(this.selectedYear, endMonth, endDay);
    
    // Handle winter season spanning two years
    if (this.selectedSeason === 'winter') {
      endDate.setFullYear(this.selectedYear + 1);
    }
    
    this.startDate = this.formatDate(startDate);
    this.endDate = this.formatDate(endDate);
  }

  getSeasonalMonths(season: string): string {
    switch (season) {
      case 'spring': return 'March - May';
      case 'summer': return 'June - August';
      case 'fall': return 'September - November';
      case 'winter': return 'December - February';
      default: return '';
    }
  }

  getDateRangeSummary(): string {
    if (!this.startDate || !this.endDate) {
      return 'No date range selected';
    }
    
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()} (${daysDiff} days)`;
  }

  continueToDashboard() {
    if (this.isDateRangeValid()) {
      // Create date range object
      const dateRange: DateRange = {
        startDate: new Date(this.startDate),
        endDate: new Date(this.endDate),
        isSeasonal: this.selectionMode === 'seasonal',
        season: this.selectionMode === 'seasonal' ? this.selectedSeason : undefined
      };
      
      // Navigate to dashboard
      this.router.navigate(['/dashboard']);
    }
  }

  goBack() {
    this.router.navigate(['/variables']);
  }

  isDateRangeValid(): boolean {
    if (!this.startDate || !this.endDate) {
      return false;
    }
    
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    
    // Check if start date is before end date
    if (start >= end) {
      return false;
    }
    
    // Check if dates are not too far in the future
    const today = new Date();
    if (start > today || end > today) {
      return false;
    }
    
    // Check if date range is not too long (max 10 years)
    const maxRange = 10 * 365 * 24 * 60 * 60 * 1000; // 10 years in milliseconds
    if (end.getTime() - start.getTime() > maxRange) {
      return false;
    }
    
    return true;
  }

  getValidationMessage(): string {
    if (!this.startDate || !this.endDate) {
      return 'Please select both start and end dates';
    }
    
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    
    if (start >= end) {
      return 'Start date must be before end date';
    }
    
    const today = new Date();
    if (start > today || end > today) {
      return 'Dates cannot be in the future';
    }
    
    const maxRange = 10 * 365 * 24 * 60 * 60 * 1000;
    if (end.getTime() - start.getTime() > maxRange) {
      return 'Date range cannot exceed 10 years';
    }
    
    return '';
  }

  getAvailableYears(): number[] {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Generate years from 1980 to current year
    for (let year = 1980; year <= currentYear; year++) {
      years.push(year);
    }
    
    return years.reverse(); // Most recent first
  }
}

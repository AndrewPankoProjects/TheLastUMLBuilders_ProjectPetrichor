import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WeatherDataService } from '../../services/weather-data.service';
import { LocationService } from '../../services/location.service';
import { WeatherVariable } from '../../models/weather-data.model';
import { AVAILABLE_WEATHER_VARIABLES, WEATHER_VARIABLE_CATEGORIES } from '../../models/weather-variables';

@Component({
  selector: 'app-variable-selector',
  templateUrl: './variable-selector.page.html',
  styleUrls: ['./variable-selector.page.scss'],
})
export class VariableSelectorPage implements OnInit {
  availableVariables = AVAILABLE_WEATHER_VARIABLES;
  categories = WEATHER_VARIABLE_CATEGORIES;
  selectedVariables: WeatherVariable[] = [];
  selectedLocation: any = null;
  searchQuery = '';
  selectedCategory = 'all';
  
  // Group variables by category
  variablesByCategory: { [key: string]: WeatherVariable[] } = {};

  constructor(
    private router: Router,
    private weatherDataService: WeatherDataService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.groupVariablesByCategory();
    this.locationService.selectedLocation$.subscribe(location => {
      this.selectedLocation = location;
    });
  }

  groupVariablesByCategory() {
    this.variablesByCategory = {};
    this.categories.forEach(category => {
      this.variablesByCategory[category.id] = this.availableVariables.filter(
        variable => variable.category === category.id
      );
    });
  }

  getFilteredVariables(): WeatherVariable[] {
    let variables = this.availableVariables;

    // Filter by category
    if (this.selectedCategory !== 'all') {
      variables = variables.filter(variable => variable.category === this.selectedCategory);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      variables = variables.filter(variable =>
        variable.name.toLowerCase().includes(query) ||
        variable.description.toLowerCase().includes(query) ||
        variable.category.toLowerCase().includes(query)
      );
    }

    return variables;
  }

  toggleVariable(variable: WeatherVariable) {
    const index = this.selectedVariables.findIndex(v => v.id === variable.id);
    if (index > -1) {
      this.selectedVariables.splice(index, 1);
    } else {
      this.selectedVariables.push(variable);
    }
  }

  isVariableSelected(variable: WeatherVariable): boolean {
    return this.selectedVariables.some(v => v.id === variable.id);
  }

  selectAllInCategory(categoryId: string) {
    const categoryVariables = this.variablesByCategory[categoryId];
    const allSelected = categoryVariables.every(variable => this.isVariableSelected(variable));
    
    if (allSelected) {
      // Deselect all in category
      categoryVariables.forEach(variable => {
        const index = this.selectedVariables.findIndex(v => v.id === variable.id);
        if (index > -1) {
          this.selectedVariables.splice(index, 1);
        }
      });
    } else {
      // Select all in category
      categoryVariables.forEach(variable => {
        if (!this.isVariableSelected(variable)) {
          this.selectedVariables.push(variable);
        }
      });
    }
  }

  isCategoryFullySelected(categoryId: string): boolean {
    const categoryVariables = this.variablesByCategory[categoryId];
    return categoryVariables.every(variable => this.isVariableSelected(variable));
  }

  isCategoryPartiallySelected(categoryId: string): boolean {
    const categoryVariables = this.variablesByCategory[categoryId];
    const selectedCount = categoryVariables.filter(variable => this.isVariableSelected(variable)).length;
    return selectedCount > 0 && selectedCount < categoryVariables.length;
  }

  clearAllSelections() {
    this.selectedVariables = [];
  }

  selectRecommended() {
    // Select commonly used variables
    const recommendedIds = ['temp_avg', 'precipitation', 'wind_speed', 'cloud_cover'];
    this.selectedVariables = this.availableVariables.filter(variable =>
      recommendedIds.includes(variable.id)
    );
  }

  continueToDateRange() {
    if (this.selectedVariables.length > 0) {
      // Store selected variables in service or state
      this.router.navigate(['/date-range']);
    }
  }

  goBack() {
    this.router.navigate(['/location']);
  }

  canContinue(): boolean {
    return this.selectedVariables.length > 0;
  }

  getSelectedCount(): number {
    return this.selectedVariables.length;
  }

  getCategoryIcon(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.icon || 'help-circle';
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  }

  onSearchInput(event: any) {
    this.searchQuery = event.target.value;
  }

  onCategoryChange(event: any) {
    this.selectedCategory = event.detail.value;
  }
}

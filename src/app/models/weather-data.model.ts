export interface Location {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
  state?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  isSeasonal?: boolean;
  season?: 'spring' | 'summer' | 'fall' | 'winter';
}

export interface WeatherVariable {
  id: string;
  name: string;
  unit: string;
  description: string;
  category: 'temperature' | 'precipitation' | 'wind' | 'cloud' | 'humidity' | 'other';
  nasaDataset?: string;
  nasaVariable?: string;
}

export interface WeatherDataPoint {
  date: Date;
  value: number;
  unit: string;
  variable: string;
  location: Location;
  source: string;
  quality?: number;
}

export interface WeatherAnalysis {
  id: string;
  variable: WeatherVariable;
  location: Location;
  dateRange: DateRange;
  dataPoints: WeatherDataPoint[];
  statistics: {
    mean: number;
    median: number;
    min: number;
    max: number;
    standardDeviation: number;
    percentile25: number;
    percentile75: number;
  };
  probability?: {
    condition: string;
    probability: number;
    description: string;
  };
  trends?: {
    direction: 'increasing' | 'decreasing' | 'stable';
    rate: number;
    significance: number;
  };
  status: 'completed' | 'processing' | 'failed';
  createdAt: Date;
}

export interface NasaApiResponse {
  success: boolean;
  data: WeatherDataPoint[];
  metadata: {
    dataset: string;
    variable: string;
    timeRange: string;
    spatialCoverage: string;
    units: string;
    source: string;
  };
  error?: string;
}

export interface QueryParameters {
  location: Location;
  variables: WeatherVariable[];
  dateRange: DateRange;
  spatialResolution?: number;
  temporalResolution?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

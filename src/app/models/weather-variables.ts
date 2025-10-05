import { WeatherVariable } from './weather-data.model';

export const AVAILABLE_WEATHER_VARIABLES: WeatherVariable[] = [
  // Temperature Variables
  {
    id: 'temp_avg',
    name: 'Average Temperature',
    unit: '°C',
    description: 'Daily average temperature',
    category: 'temperature',
    nasaDataset: 'MERRA-2',
    nasaVariable: 'T2M'
  },
  {
    id: 'temp_max',
    name: 'Maximum Temperature',
    unit: '°C',
    description: 'Daily maximum temperature',
    category: 'temperature',
    nasaDataset: 'MERRA-2',
    nasaVariable: 'T2MMAX'
  },
  {
    id: 'temp_min',
    name: 'Minimum Temperature',
    unit: '°C',
    description: 'Daily minimum temperature',
    category: 'temperature',
    nasaDataset: 'MERRA-2',
    nasaVariable: 'T2MMIN'
  },
  {
    id: 'heat_index',
    name: 'Heat Index',
    unit: '°C',
    description: 'Apparent temperature considering humidity',
    category: 'temperature',
    nasaDataset: 'MERRA-2',
    nasaVariable: 'T2M'
  },

  // Precipitation Variables
  {
    id: 'precipitation',
    name: 'Precipitation',
    unit: 'mm',
    description: 'Daily total precipitation',
    category: 'precipitation',
    nasaDataset: 'MERRA-2',
    nasaVariable: 'PRECTOT'
  },
  {
    id: 'snowfall',
    name: 'Snowfall',
    unit: 'mm',
    description: 'Daily snowfall amount',
    category: 'precipitation',
    nasaDataset: 'MERRA-2',
    nasaVariable: 'PRECSNO'
  },
  {
    id: 'snow_depth',
    name: 'Snow Depth',
    unit: 'cm',
    description: 'Snow depth on ground',
    category: 'precipitation',
    nasaDataset: 'MERRA-2',
    nasaVariable: 'SNODP'
  },

  // Wind Variables
  {
    id: 'wind_speed',
    name: 'Wind Speed',
    unit: 'm/s',
    description: 'Average wind speed at 10m height',
    category: 'wind',
    nasaDataset: 'MERRA-2',
    nasaVariable: 'WS10M'
  },
  {
    id: 'wind_direction',
    name: 'Wind Direction',
    unit: 'degrees',
    description: 'Wind direction at 10m height',
    category: 'wind',
    nasaDataset: 'MERRA-2',
    nasaVariable: 'WD10M'
  },

  // Cloud and Atmospheric Variables
  {
    id: 'cloud_cover',
    name: 'Cloud Cover',
    unit: '%',
    description: 'Total cloud cover percentage',
    category: 'cloud',
    nasaDataset: 'MERRA-2',
    nasaVariable: 'CLDTOT'
  },
  {
    id: 'relative_humidity',
    name: 'Relative Humidity',
    unit: '%',
    description: 'Relative humidity at 2m height',
    category: 'humidity',
    nasaDataset: 'MERRA-2',
    nasaVariable: 'RH2M'
  },
  {
    id: 'pressure',
    name: 'Surface Pressure',
    unit: 'hPa',
    description: 'Surface atmospheric pressure',
    category: 'other',
    nasaDataset: 'MERRA-2',
    nasaVariable: 'PS'
  },

  // Dust and Air Quality
  {
    id: 'dust_concentration',
    name: 'Dust Concentration',
    unit: 'μg/m³',
    description: 'Surface dust concentration',
    category: 'other',
    nasaDataset: 'MERRA-2',
    nasaVariable: 'DUSTTOT'
  }
];

export const WEATHER_VARIABLE_CATEGORIES = [
  { id: 'temperature', name: 'Temperature', icon: 'thermometer' },
  { id: 'precipitation', name: 'Precipitation', icon: 'rainy' },
  { id: 'wind', name: 'Wind', icon: 'leaf' },
  { id: 'cloud', name: 'Cloud Cover', icon: 'cloudy' },
  { id: 'humidity', name: 'Humidity', icon: 'water' },
  { id: 'other', name: 'Other', icon: 'analytics' }
];

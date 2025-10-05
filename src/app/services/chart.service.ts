import { Injectable } from '@angular/core';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { WeatherDataPoint, WeatherAnalysis, WeatherVariable } from '../models/weather-data.model';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() {}

  /**
   * Create time series chart configuration
   */
  createTimeSeriesChart(analysis: WeatherAnalysis): ChartConfiguration {
    const labels = analysis.dataPoints.map(point => 
      point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
    
    const data = analysis.dataPoints.map(point => point.value);
    
    const chartData: ChartData = {
      labels,
      datasets: [{
        label: `${analysis.variable.name} (${analysis.variable.unit})`,
        data,
        borderColor: this.getColorForVariable(analysis.variable.category),
        backgroundColor: this.getColorForVariable(analysis.variable.category, 0.1),
        borderWidth: 2,
        fill: true,
        tension: 0.1
      }]
    };

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `${analysis.variable.name} at ${analysis.location.name}`,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const point = analysis.dataPoints[context.dataIndex];
              return `${context.dataset.label}: ${point.value} ${analysis.variable.unit}`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: analysis.variable.unit
          }
        }
      }
    };

    return {
      type: 'line',
      data: chartData,
      options
    };
  }

  /**
   * Create histogram chart configuration
   */
  createHistogramChart(analysis: WeatherAnalysis): ChartConfiguration {
    const values = analysis.dataPoints.map(point => point.value);
    const bins = this.createHistogramBins(values, 10);
    
    const labels = bins.map(bin => `${bin.min.toFixed(1)}-${bin.max.toFixed(1)}`);
    const data = bins.map(bin => bin.count);
    
    const chartData: ChartData = {
      labels,
      datasets: [{
        label: `Frequency Distribution`,
        data,
        backgroundColor: this.getColorForVariable(analysis.variable.category, 0.7),
        borderColor: this.getColorForVariable(analysis.variable.category),
        borderWidth: 1
      }]
    };

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Distribution of ${analysis.variable.name}`,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: `${analysis.variable.name} (${analysis.variable.unit})`
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Frequency'
          },
          beginAtZero: true
        }
      }
    };

    return {
      type: 'bar',
      data: chartData,
      options
    };
  }

  /**
   * Create statistics summary chart
   */
  createStatisticsChart(analysis: WeatherAnalysis): ChartConfiguration {
    const stats = analysis.statistics;
    const labels = ['Min', '25th %ile', 'Median', '75th %ile', 'Max'];
    const data = [
      stats.min,
      stats.percentile25,
      stats.median,
      stats.percentile75,
      stats.max
    ];
    
    const chartData: ChartData = {
      labels,
      datasets: [{
        label: `${analysis.variable.name} (${analysis.variable.unit})`,
        data,
        backgroundColor: this.getColorForVariable(analysis.variable.category, 0.7),
        borderColor: this.getColorForVariable(analysis.variable.category),
        borderWidth: 2
      }]
    };

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Statistical Summary`,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          display: true,
          title: {
            display: true,
            text: analysis.variable.unit
          }
        }
      }
    };

    return {
      type: 'bar',
      data: chartData,
      options
    };
  }

  /**
   * Create probability chart
   */
  createProbabilityChart(analysis: WeatherAnalysis): ChartConfiguration {
    if (!analysis.probability) {
      throw new Error('No probability data available');
    }

    const labels = ['Normal Conditions', analysis.probability.condition];
    const data = [
      100 - analysis.probability.probability,
      analysis.probability.probability
    ];
    
    const chartData: ChartData = {
      labels,
      datasets: [{
        label: 'Probability (%)',
        data,
        backgroundColor: [
          this.getColorForVariable(analysis.variable.category, 0.3),
          this.getColorForVariable(analysis.variable.category, 0.8)
        ],
        borderColor: [
          this.getColorForVariable(analysis.variable.category),
          this.getColorForVariable(analysis.variable.category)
        ],
        borderWidth: 2
      }]
    };

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Probability of Extreme Conditions`,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'bottom'
        }
      }
    };

    return {
      type: 'doughnut',
      data: chartData,
      options
    };
  }

  /**
   * Create histogram bins
   */
  private createHistogramBins(values: number[], numBins: number): Array<{min: number, max: number, count: number}> {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / numBins;
    
    const bins: Array<{min: number, max: number, count: number}> = [];
    
    for (let i = 0; i < numBins; i++) {
      const binMin = min + i * binWidth;
      const binMax = min + (i + 1) * binWidth;
      const count = values.filter(val => val >= binMin && val < binMax).length;
      
      bins.push({ min: binMin, max: binMax, count });
    }
    
    return bins;
  }

  /**
   * Get color for variable category
   */
  private getColorForVariable(category: WeatherVariable['category'], alpha: number = 1): string {
    const colors: { [key in WeatherVariable['category']]: string } = {
      temperature: `rgba(255, 99, 132, ${alpha})`,      // Red
      precipitation: `rgba(54, 162, 235, ${alpha})`,    // Blue
      wind: `rgba(255, 206, 86, ${alpha})`,             // Yellow
      cloud: `rgba(75, 192, 192, ${alpha})`,            // Teal
      humidity: `rgba(153, 102, 255, ${alpha})`,        // Purple
      other: `rgba(255, 159, 64, ${alpha})`             // Orange
    };
    
    return colors[category] || colors['other'];
  }

  /**
   * Export chart as image
   */
  exportChartAsImage(chart: any, filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = chart.toBase64Image();
    link.click();
  }

  /**
   * Get chart dimensions based on container
   */
  getChartDimensions(containerElement: HTMLElement): { width: number; height: number } {
    const rect = containerElement.getBoundingClientRect();
    return {
      width: rect.width,
      height: Math.max(300, rect.height)
    };
  }
}

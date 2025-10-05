import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/weather',
    pathMatch: 'full'
  },
  {
    path: 'weather',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
  },
  {
    path: 'simple',
    loadComponent: () => import('./pages/simple-weather/simple-weather.page').then(m => m.SimpleWeatherPage)
  }
];

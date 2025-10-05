import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'explore',
        loadComponent: () =>
          import('../pages/weather-explore-tab/weather-explore-tab.page').then((m) => m.WeatherExploreTabPage),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('../pages/weather-history-tab/weather-history-tab.page').then((m) => m.WeatherHistoryTabPage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../pages/weather-settings-tab/weather-settings-tab.page').then((m) => m.WeatherSettingsTabPage),
      },
      {
        path: '',
        redirectTo: '/weather/tabs/explore',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/weather/tabs/explore',
    pathMatch: 'full',
  },
];

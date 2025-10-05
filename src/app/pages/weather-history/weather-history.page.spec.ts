import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeatherHistoryPage } from './weather-history.page';

describe('WeatherHistoryPage', () => {
  let component: WeatherHistoryPage;
  let fixture: ComponentFixture<WeatherHistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

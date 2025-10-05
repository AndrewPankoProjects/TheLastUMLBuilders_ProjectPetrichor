import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeatherExplorePage } from './weather-explore.page';

describe('WeatherExplorePage', () => {
  let component: WeatherExplorePage;
  let fixture: ComponentFixture<WeatherExplorePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherExplorePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

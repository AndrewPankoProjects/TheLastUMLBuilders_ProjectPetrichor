import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePickerPage } from './date-picker.page';

describe('DatePickerPage', () => {
  let component: DatePickerPage;
  let fixture: ComponentFixture<DatePickerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DatePickerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

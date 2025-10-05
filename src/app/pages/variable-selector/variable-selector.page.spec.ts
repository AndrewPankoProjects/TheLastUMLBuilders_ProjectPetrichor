import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VariableSelectorPage } from './variable-selector.page';

describe('VariableSelectorPage', () => {
  let component: VariableSelectorPage;
  let fixture: ComponentFixture<VariableSelectorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VariableSelectorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSchoolYearComponent } from './view-school-year.component';

describe('ViewSchoolYearComponent', () => {
  let component: ViewSchoolYearComponent;
  let fixture: ComponentFixture<ViewSchoolYearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSchoolYearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewSchoolYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

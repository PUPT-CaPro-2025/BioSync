import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolYearComponent } from './school-year.component';

describe('SchoolYearComponent', () => {
  let component: SchoolYearComponent;
  let fixture: ComponentFixture<SchoolYearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolYearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchoolYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

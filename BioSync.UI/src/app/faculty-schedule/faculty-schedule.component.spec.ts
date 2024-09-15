import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyScheduleComponent } from './faculty-schedule.component';

describe('FacultyScheduleComponent', () => {
  let component: FacultyScheduleComponent;
  let fixture: ComponentFixture<FacultyScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacultyScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

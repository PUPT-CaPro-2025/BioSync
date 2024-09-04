import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyAttendanceComponent } from './faculty-attendance.component';

describe('FacultyAttendanceComponent', () => {
  let component: FacultyAttendanceComponent;
  let fixture: ComponentFixture<FacultyAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacultyAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStudentAttendanceComponent } from './view-student-attendance.component';

describe('ViewStudentAttendanceComponent', () => {
  let component: ViewStudentAttendanceComponent;
  let fixture: ComponentFixture<ViewStudentAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewStudentAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewStudentAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

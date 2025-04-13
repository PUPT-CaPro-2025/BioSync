import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogAttendanceComponent } from './log-attendance.component';

describe('LogAttendanceComponent', () => {
  let component: LogAttendanceComponent;
  let fixture: ComponentFixture<LogAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

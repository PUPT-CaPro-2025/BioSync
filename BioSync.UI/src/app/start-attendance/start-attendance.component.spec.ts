import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartAttendanceComponent } from './start-attendance.component';

describe('StartAttendanceComponent', () => {
  let component: StartAttendanceComponent;
  let fixture: ComponentFixture<StartAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAttendanceComponent } from './view-attendance.component';

describe('ViewAttendanceComponent', () => {
  let component: ViewAttendanceComponent;
  let fixture: ComponentFixture<ViewAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceRecognitionAttendanceComponent } from './face-recognition-attendance.component';

describe('FaceRecognitionAttendanceComponent', () => {
  let component: FaceRecognitionAttendanceComponent;
  let fixture: ComponentFixture<FaceRecognitionAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaceRecognitionAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceRecognitionAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartAttendanceFaceComponent } from './start-attendance-face.component';

describe('StartAttendanceFaceComponent', () => {
  let component: StartAttendanceFaceComponent;
  let fixture: ComponentFixture<StartAttendanceFaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartAttendanceFaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartAttendanceFaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

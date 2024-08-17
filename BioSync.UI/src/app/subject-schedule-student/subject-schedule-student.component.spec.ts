import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectScheduleStudentComponent } from './subject-schedule-student.component';

describe('SubjectScheduleStudentComponent', () => {
  let component: SubjectScheduleStudentComponent;
  let fixture: ComponentFixture<SubjectScheduleStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectScheduleStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectScheduleStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

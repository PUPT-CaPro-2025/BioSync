import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceManagementProfessorComponent } from './attendance-management-professor.component';

describe('AttendanceManagementProfessorComponent', () => {
  let component: AttendanceManagementProfessorComponent;
  let fixture: ComponentFixture<AttendanceManagementProfessorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceManagementProfessorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceManagementProfessorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

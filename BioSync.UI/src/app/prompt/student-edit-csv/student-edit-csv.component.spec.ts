import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentEditCsvComponent } from './student-edit-csv.component';

describe('StudentEditCsvComponent', () => {
  let component: StudentEditCsvComponent;
  let fixture: ComponentFixture<StudentEditCsvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentEditCsvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentEditCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

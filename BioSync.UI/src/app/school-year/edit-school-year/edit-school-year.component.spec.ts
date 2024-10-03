import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSchoolYearComponent } from './edit-school-year.component';

describe('EditSchoolYearComponent', () => {
  let component: EditSchoolYearComponent;
  let fixture: ComponentFixture<EditSchoolYearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSchoolYearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSchoolYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

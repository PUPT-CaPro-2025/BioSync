import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSchoolYearComponent } from './add-school-year.component';

describe('AddSchoolYearComponent', () => {
  let component: AddSchoolYearComponent;
  let fixture: ComponentFixture<AddSchoolYearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSchoolYearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSchoolYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

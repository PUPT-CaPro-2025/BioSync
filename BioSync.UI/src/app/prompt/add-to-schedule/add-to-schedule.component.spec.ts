import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToScheduleComponent } from './add-to-schedule.component';

describe('AddToScheduleComponent', () => {
  let component: AddToScheduleComponent;
  let fixture: ComponentFixture<AddToScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddToScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddToScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

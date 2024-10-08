import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestListScheduleComponent } from './request-list-schedule.component';

describe('RequestListScheduleComponent', () => {
  let component: RequestListScheduleComponent;
  let fixture: ComponentFixture<RequestListScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestListScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestListScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

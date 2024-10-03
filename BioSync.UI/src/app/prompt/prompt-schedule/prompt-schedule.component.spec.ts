import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptScheduleComponent } from './prompt-schedule.component';

describe('PromptScheduleComponent', () => {
  let component: PromptScheduleComponent;
  let fixture: ComponentFixture<PromptScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

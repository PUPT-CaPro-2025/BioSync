import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomRecurrenceModalComponent } from './custom-recurrence-modal.component';

describe('CustomRecurrenceModalComponent', () => {
  let component: CustomRecurrenceModalComponent;
  let fixture: ComponentFixture<CustomRecurrenceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomRecurrenceModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomRecurrenceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

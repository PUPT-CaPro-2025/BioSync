import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptEventsComponent } from './prompt-events.component';

describe('PromptEventsComponent', () => {
  let component: PromptEventsComponent;
  let fixture: ComponentFixture<PromptEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

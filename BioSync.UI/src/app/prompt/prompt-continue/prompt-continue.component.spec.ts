import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptContinueComponent } from './prompt-continue.component';

describe('PromptContinueComponent', () => {
  let component: PromptContinueComponent;
  let fixture: ComponentFixture<PromptContinueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptContinueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptContinueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

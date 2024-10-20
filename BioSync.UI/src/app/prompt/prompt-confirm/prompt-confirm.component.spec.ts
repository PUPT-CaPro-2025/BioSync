import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptConfirmComponent } from './prompt-confirm.component';

describe('PromptConfirmComponent', () => {
  let component: PromptConfirmComponent;
  let fixture: ComponentFixture<PromptConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

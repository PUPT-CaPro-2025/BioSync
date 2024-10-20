import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptOkayComponent } from './prompt-okay.component';

describe('PromptOkayComponent', () => {
  let component: PromptOkayComponent;
  let fixture: ComponentFixture<PromptOkayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptOkayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptOkayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

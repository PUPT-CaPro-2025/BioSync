import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptSyncComponent } from './prompt-sync.component';

describe('PromptSyncComponent', () => {
  let component: PromptSyncComponent;
  let fixture: ComponentFixture<PromptSyncComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptSyncComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptSyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

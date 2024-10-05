import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptCsvComponent } from './prompt-csv.component';

describe('PromptCsvComponent', () => {
  let component: PromptCsvComponent;
  let fixture: ComponentFixture<PromptCsvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptCsvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

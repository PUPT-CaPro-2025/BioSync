import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitPurposeComponent } from './visit-purpose.component';

describe('VisitPurposeComponent', () => {
  let component: VisitPurposeComponent;
  let fixture: ComponentFixture<VisitPurposeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitPurposeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitPurposeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

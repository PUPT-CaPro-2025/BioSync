import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVisitPurposeComponent } from './add-visit-purpose.component';

describe('AddVisitPurposeComponent', () => {
  let component: AddVisitPurposeComponent;
  let fixture: ComponentFixture<AddVisitPurposeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddVisitPurposeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddVisitPurposeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVisitPurposeComponent } from './edit-visit-purpose.component';

describe('EditVisitPurposeComponent', () => {
  let component: EditVisitPurposeComponent;
  let fixture: ComponentFixture<EditVisitPurposeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditVisitPurposeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditVisitPurposeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

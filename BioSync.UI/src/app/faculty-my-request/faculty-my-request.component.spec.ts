import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyMyRequestComponent } from './faculty-my-request.component';

describe('FacultyMyRequestComponent', () => {
  let component: FacultyMyRequestComponent;
  let fixture: ComponentFixture<FacultyMyRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacultyMyRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyMyRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

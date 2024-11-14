import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSuffixComponent } from './edit-suffix.component';

describe('EditSuffixComponent', () => {
  let component: EditSuffixComponent;
  let fixture: ComponentFixture<EditSuffixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSuffixComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSuffixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

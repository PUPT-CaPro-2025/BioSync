import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSuffixComponent } from './add-suffix.component';

describe('AddSuffixComponent', () => {
  let component: AddSuffixComponent;
  let fixture: ComponentFixture<AddSuffixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSuffixComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSuffixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

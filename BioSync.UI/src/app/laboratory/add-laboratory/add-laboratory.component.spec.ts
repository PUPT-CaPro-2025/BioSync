import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLaboratoryComponent } from './add-laboratory.component';

describe('AddLaboratoryComponent', () => {
  let component: AddLaboratoryComponent;
  let fixture: ComponentFixture<AddLaboratoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddLaboratoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLaboratoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

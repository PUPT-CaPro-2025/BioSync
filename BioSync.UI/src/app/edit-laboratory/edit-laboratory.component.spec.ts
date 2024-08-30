import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLaboratoryComponent } from './edit-laboratory.component';

describe('EditLaboratoryComponent', () => {
  let component: EditLaboratoryComponent;
  let fixture: ComponentFixture<EditLaboratoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditLaboratoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditLaboratoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

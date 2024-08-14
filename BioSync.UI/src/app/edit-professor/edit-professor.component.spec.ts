import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProfessorComponent } from './edit-professor.component';

describe('EditProfessorComponent', () => {
  let component: EditProfessorComponent;
  let fixture: ComponentFixture<EditProfessorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProfessorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProfessorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

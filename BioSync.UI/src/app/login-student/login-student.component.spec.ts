import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginStudentComponent } from './login-student.component';

describe('LoginStudentComponent', () => {
  let component: LoginStudentComponent;
  let fixture: ComponentFixture<LoginStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

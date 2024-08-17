import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginFacultyComponent } from './login-faculty.component';

describe('LoginFacultyComponent', () => {
  let component: LoginFacultyComponent;
  let fixture: ComponentFixture<LoginFacultyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginFacultyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginFacultyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

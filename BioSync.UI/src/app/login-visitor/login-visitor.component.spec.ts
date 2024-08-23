import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginVisitorComponent } from './login-visitor.component';

describe('LoginVisitorComponent', () => {
  let component: LoginVisitorComponent;
  let fixture: ComponentFixture<LoginVisitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginVisitorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginVisitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

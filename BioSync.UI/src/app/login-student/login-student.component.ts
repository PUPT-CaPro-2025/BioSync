import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatInput} from "@angular/material/input";
import {AuthService} from "../../services/auth/auth.service";
import {Authentication} from "../../model/authentication.model";
import {LoginService} from "../../services/auth/login.service";
import {CookieService} from "../../services/cookie.service";
import {LoginAdminComponent} from "../login-admin/login-admin.component";

@Component({
  selector: 'app-login-student',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule, MatInput],
  providers: [LoginService, CookieService, LoginAdminComponent],
  templateUrl: './login-student.component.html',
  styleUrl: './login-student.component.css'
})
export class LoginStudentComponent implements OnInit {
  studentLoginForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private cookieService: CookieService,
    private alComponent: LoginAdminComponent
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(): void{
    this.studentLoginForm = this.formBuilder.group({
        usercode: ['', [Validators.required]],
        password: ['', [Validators.required]],
      }
    )
  }

  submit(): void{
    if(!this.studentLoginForm.valid) return; //TODO: ADD PROMPT

    const studentCredentials = this.studentLoginForm.value;

    this.loginService.login(studentCredentials).subscribe({
      next: (response: Authentication) => {
        if(response.role !== 'STUDENT') return //TODO: ADD PROMPT

        const token = response.token;

        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;

        this.cookieService.setCookie("authToken", token, expiry)
        this.cookieService.setCookie("role", response.role);

        this.alComponent.navigateTo('/dashboard');
      },
      error: err => console.error(err)
    })
  }
}

import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Authentication} from "../../model/authentication.model";
import {LoginService} from "../../services/login.service";
import {LoginAdminComponent} from "../login-admin/login-admin.component";
import {MatInput} from "@angular/material/input";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";
import {CookieService} from "../../services/cookie.service";

@Component({
  selector: 'app-login-faculty',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule, MatInput],
  providers: [LoginService, LoginAdminComponent, AuthService],
  templateUrl: './login-faculty.component.html',
  styleUrl: './login-faculty.component.css'
})
export class LoginFacultyComponent implements OnInit{
  facultyLoginForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private alComp: LoginAdminComponent,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']).then();
    }
  }

  initForm(): void{
    this.facultyLoginForm = this.formBuilder.group({
        usercode: ['', [Validators.required]],
        password: ['', [Validators.required]],
      }
    )
  }

  submit(): void{
    if(!this.facultyLoginForm.valid) return; //TODO: ADD PROMPT

    const facultyCredentials = this.facultyLoginForm.value;

    this.loginService.login(facultyCredentials).subscribe({
      next: (response: Authentication) => {
        if(response.role !== 'FACULTY') return //TODO: ADD PROMPT

        const token = response.token;

        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;

        const expires = new Date(expiry).toUTCString();
        document.cookie = `authToken=${token}; expires=${expires}; path=/; SameSite=Strict`;
        document.cookie = `role=${response.role};`

        this.alComp.navigateTo('/dashboard');
      },
      error: err => console.error(err)
    })
  }

}

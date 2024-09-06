import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import { Router } from '@angular/router';
import {LoginService} from "../../services/auth/login.service";
import {Authentication} from "../../model/authentication.model";
import {MatInput} from "@angular/material/input";
import {AuthService} from "../../services/auth/auth.service";
import {CookieService} from "../../services/cookie.service";

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule, MatInput],
  providers: [LoginService, AuthService, CookieService],
  templateUrl: './login-admin.component.html',
  styleUrl: './login-admin.component.css'
})
export class LoginAdminComponent implements OnInit {
  adminLoginForm!: FormGroup;
  credentialsError = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private authService: AuthService,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    this.initForm();
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']).then();
    }
  }

  initForm(): void{
    this.adminLoginForm = this.formBuilder.group({
        usercode: ['', [Validators.required]],
        password: ['', [Validators.required]],
      }
    )
  }

  submit(): void{
    if(!this.adminLoginForm.valid) return;

    const adminCredentials = this.adminLoginForm.value;

    this.loginService.login(adminCredentials).subscribe({
      next: (response: Authentication) => {
        if(response.role !== 'ADMIN') {
          this.credentialsError = !this.credentialsError;
          return;
        }

        const token = response.token;

        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;

        this.cookieService.setCookie("authToken", token, expiry)
        this.cookieService.setCookie("role", response.role);

        this.navigateTo('/dashboard');
      },
      error: () => {
        this.credentialsError = !this.credentialsError;
      }
    })
  }

  navigateTo(route: string) {
    this.router.navigate([route]).then();
  }
}

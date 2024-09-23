import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatInput} from "@angular/material/input";
import {Authentication} from "../../model/authentication.model";
import {LoginService} from "../../services/auth/login.service";
import {CookieService} from "../../services/cookie.service";
import {LoginAdminComponent} from "../login-admin/login-admin.component";
import {CryptoService} from "../../services/crypto.service";
import {ex} from "@fullcalendar/core/internal-common";

@Component({
  selector: 'app-login-student',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule, MatInput],
  providers: [LoginService, CookieService, LoginAdminComponent, CryptoService],
  templateUrl: './login-student.component.html',
  styleUrl: './login-student.component.css'
})
export class LoginStudentComponent implements OnInit {
  studentLoginForm!: FormGroup;
  credentialsError = false;

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private cookieService: CookieService,
    private alComponent: LoginAdminComponent,
    private cryptoService: CryptoService,
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
    if(!this.studentLoginForm.valid) return;

    const studentCredentials = this.studentLoginForm.value;

    this.loginService.login(studentCredentials).subscribe({
      next: (response: Authentication) => {
        if(response.role !== 'STUDENT') {
          this.credentialsError = !this.credentialsError;
          return;
        }

        const token = response.token;

        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;
        const encryptedUserId = this.cryptoService.encrypt(response.userId);
        const encryptedRole = this.cryptoService.encrypt(response.role);

        this.cookieService.setCookie("authToken", token, expiry);
        this.cookieService.setCookie("role", encryptedRole, expiry);
        this.cookieService.setCookie("user_id", encryptedUserId, expiry);

        this.alComponent.navigateTo('/dashboard');
      },
      error: () => {
        this.credentialsError = !this.credentialsError;
      }
    })
  }
}

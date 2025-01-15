import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Authentication } from '../../model/authentication.model';
import { Router } from '@angular/router';
import { LoginService } from '../../services/auth/login.service';
import { AuthService } from '../../services/auth/auth.service';
import { CookieService } from '../../services/cookie.service';
import { CryptoService } from '../../services/crypto.service';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [MatIconModule, MatInput, ReactiveFormsModule],
  providers: [LoginService, AuthService, CookieService, CryptoService],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css',
})
export class UserLoginComponent implements OnInit {
  userLoginForm!: FormGroup;
  credentialsError = false;
  passwordVisible = false;
  passwordFieldType = 'password';

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private authService: AuthService,
    private cookieService: CookieService,
    private cryptoService: CryptoService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']).then();
    }
  }

  initForm() {
    this.userLoginForm = this.formBuilder.group({
      usercode: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
    this.passwordFieldType = this.passwordVisible ? 'text' : 'password';
  }

  submit(): void {
    if (!this.userLoginForm.valid) return;

    const userCredentials = this.userLoginForm.value;

    this.loginService.login(userCredentials).subscribe({
      next: (response: Authentication) => {
        const token = response.token;

        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;
        const encryptedRole = this.cryptoService.encrypt(response.role);

        this.cookieService.setCookie('authToken', token, expiry);
        this.cookieService.setCookie('role', encryptedRole, expiry);

        const encryptedUserId = this.cryptoService.encrypt(response.userId);
        this.cookieService.setCookie('user_id', encryptedUserId, expiry);

        this.navigateTo('/dashboard');
      },
      error: () => {
        this.credentialsError = !this.credentialsError;
      },
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]).then();
  }
}

import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import { Router } from '@angular/router';
import {LoginService} from "../landing/login.service";
import {Authentication} from "../../model/authentication.model";
import {ex} from "@fullcalendar/core/internal-common";

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule],
  providers: [LoginService],
  templateUrl: './login-admin.component.html',
  styleUrl: './login-admin.component.css'
})
export class LoginAdminComponent implements OnInit {
  adminLoginForm!: FormGroup;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(): void{
    this.adminLoginForm = this.formBuilder.group({
        usercode: ['', [Validators.required]],
        password: ['', [Validators.required]],
      }
    )
  }

  submit(): void{
    if(!this.adminLoginForm.valid) return; //TODO: ADD PROMPT

    const formValues = this.adminLoginForm.value;

    this.loginService.login(formValues).subscribe({
      next: (response: Authentication) => {
        if(response.role !== 'ADMIN') return //TODO: ADD PROMPT

        const token = response.token;

        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;

        const expires = new Date(expiry).toUTCString();
        document.cookie = `authToken=${token}; expires=${expires}; path=/; SameSite=Strict`;

        this.navigateTo('/dashboard');
      },
      error: err => console.error(err)
    })
  }

  navigateTo(route: string) {
    this.router.navigate([route]).then();
  }
}

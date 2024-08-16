import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule],
  templateUrl: './login-admin.component.html',
  styleUrl: './login-admin.component.css'
})
export class LoginAdminComponent implements OnInit {
  adminLoginForm!: FormGroup;

  constructor(private router: Router, private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(): void{
    this.adminLoginForm = this.formBuilder.group({
        user_name: ['', [Validators.required]],
        password: ['', [Validators.required]],
      }
    )
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}

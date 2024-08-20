import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatInput} from "@angular/material/input";
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-login-student',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule, MatInput],
  templateUrl: './login-student.component.html',
  styleUrl: './login-student.component.css'
})
export class LoginStudentComponent implements OnInit {
  studentLoginForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(): void{
    this.studentLoginForm = this.formBuilder.group({
        user_name: ['', [Validators.required]],
        password: ['', [Validators.required]],
      }
    )
  }
}

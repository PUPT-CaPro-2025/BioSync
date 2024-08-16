import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-login-student',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule],
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

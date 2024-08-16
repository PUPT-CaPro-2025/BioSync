import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-login-faculty',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule],
  templateUrl: './login-faculty.component.html',
  styleUrl: './login-faculty.component.css'
})
export class LoginFacultyComponent implements OnInit{
  facultyLoginForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(): void{
    this.facultyLoginForm = this.formBuilder.group({
        user_name: ['', [Validators.required]],
        password: ['', [Validators.required]],
      }
    )
  }
}

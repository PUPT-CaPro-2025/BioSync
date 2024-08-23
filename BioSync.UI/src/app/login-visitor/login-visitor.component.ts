import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-login-visitor',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule, MatSelectModule],
  templateUrl: './login-visitor.component.html',
  styleUrl: './login-visitor.component.css'
})
export class LoginVisitorComponent implements OnInit {
  visitorLogForm!: FormGroup;

  labs: string[] = [
    'DOST Laboratory',
    'Aboitiz Laboratory',
  ];

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(): void{
    this.visitorLogForm = this.formBuilder.group({
        visitor_name: ['', [Validators.required]],
        purpose_of_visit: ['', [Validators.required]],
        other_details: ['', [Validators.required]],
        destination: ['', [Validators.required]],
      }
    )
  }
}

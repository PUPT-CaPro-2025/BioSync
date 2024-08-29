import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-laboratory',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './add-laboratory.component.html',
  styleUrl: './add-laboratory.component.css'
})
export class AddLaboratoryComponent implements OnInit {
  laboratoryForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.laboratoryForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      roomCode: ['', [Validators.required]],
      capacity: ['', Validators.required]
    });
  }

  submit(){
    console.log("Submit");
    return;
  }
}

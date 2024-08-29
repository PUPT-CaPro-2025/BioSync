import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-edit-program',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,],
  templateUrl: './edit-program.component.html',
  styleUrl: './edit-program.component.css'
})
export class EditProgramComponent implements OnInit{
  programForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.programForm = this.formBuilder.group({
      programName: ['', [Validators.required]],
      programAbbrv: ['', [Validators.required]],
      description: ['', Validators.required]
    });
  }

  submit(){
    console.log("Submit");
    return;
  }
}

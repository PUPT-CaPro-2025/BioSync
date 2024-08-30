import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { Laboratory } from '../../model/laboratory.model';

@Component({
  selector: 'app-edit-laboratory',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './edit-laboratory.component.html',
  styleUrl: './edit-laboratory.component.css'
})
export class EditLaboratoryComponent implements OnInit {
  @Output() backToEditLaboratory = new EventEmitter<void>();
  @Output() updatedLaboratory = new EventEmitter<Laboratory>();
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

  returnToLaboratoryView(): void {
    this.backToEditLaboratory.emit();
  }

  submit(){
    console.log("Submit");
    return;
  }
}

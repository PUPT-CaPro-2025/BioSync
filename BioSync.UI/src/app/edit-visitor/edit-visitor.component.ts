import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-edit-visitor',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule, 
    MatSelectModule],
  templateUrl: './edit-visitor.component.html',
  styleUrl: './edit-visitor.component.css'
})
export class EditVisitorComponent {
  @Output() backToEditVisitor = new EventEmitter<void>();
  visitorForm!: FormGroup;

  labs: string[] = [
    'DOST Laboratory',
    'Aboitiz Laboratory',
  ];

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.visitorForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      visit: ['', Validators.required],
      details: ['', [Validators.required]],
      event: ['', Validators.required],
      lab: ['', [Validators.required]],
      time_in: ['', Validators.required],
      time_out: ['', [Validators.required]],
    });
  }

  cancelEditVisitor(): void {
    this.backToEditVisitor.emit();
  }

  submit() {
    console.log("Click Submit!");
    return;
  }
}

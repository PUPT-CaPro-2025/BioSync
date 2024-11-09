import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { Visitpurpose } from '../../../model/visit.purpose.model';
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../../prompt/prompt-okay/prompt-okay.component";

@Component({
  selector: 'app-add-visit-purpose',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './add-visit-purpose.component.html',
  styleUrls: ['./add-visit-purpose.component.css', '../../program/add-program/add-program.component.css']
})
export class AddVisitPurposeComponent implements OnInit {
  visitPurposeForm!: FormGroup;
  @Output() backToVisitPurpose = new EventEmitter<void>();

  constructor(private formBuilder: FormBuilder,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.visitPurposeForm = this.formBuilder.group({
      visitPurpose: ['', [Validators.required]],
    });
  }

  returnToVisitPurposeView(): void {
    this.backToVisitPurpose.emit();
  }

  submit(){
    console.log('Submit button was click!');
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Purpose of Visit Successfully Added!',
        message: 'Purpose of Visit has been added to the system successfully.'
      }
    })

    dialogRef.afterClosed().subscribe(() => {
      this.backToVisitPurpose.emit();
    })
  }
}

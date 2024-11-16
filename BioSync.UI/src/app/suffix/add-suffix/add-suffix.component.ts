import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { Suffix } from '../../../model/suffix.model';
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../../prompt/prompt-okay/prompt-okay.component";

@Component({
  selector: 'app-add-suffix',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './add-suffix.component.html',
  styleUrls: ['./add-suffix.component.css', '../../program/add-program/add-program.component.css']
})
export class AddSuffixComponent implements OnInit {
  suffixForm!: FormGroup;
  @Output() backToSuffix = new EventEmitter<void>();

  constructor(private formBuilder: FormBuilder,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.suffixForm = this.formBuilder.group({
      suffixName: ['', [Validators.required]],
      suffixAbbreviation: ['', [Validators.required]]
    });
  }

  returnToSuffixView(): void {
    this.backToSuffix.emit();
  }

  submit(){
    console.log('Submit button was click!');
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Suffix Successfully Added!',
        message: 'Suffix has been added to the system successfully.'
      }
    })

    dialogRef.afterClosed().subscribe(() => {
      this.backToSuffix.emit();
    })
  }
}

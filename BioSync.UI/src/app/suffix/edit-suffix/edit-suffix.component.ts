import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {
  FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, 
  Validators, AbstractControl
} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { Suffix } from '../../../model/suffix.model';
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../../prompt/prompt-okay/prompt-okay.component";
import { letterOnlyValidator } from '../suffix.validation';

@Component({
  selector: 'app-edit-suffix',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './edit-suffix.component.html',
  styleUrls: ['./edit-suffix.component.css', '../../program/add-program/add-program.component.css'],
})
export class EditSuffixComponent implements OnInit{
  suffixForm!: FormGroup;
  @Output() backToEditSuffix = new EventEmitter<void>();

  constructor(private formBuilder: FormBuilder,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.suffixForm = this.formBuilder.group({
      suffixName: ['', [Validators.required, letterOnlyValidator()]],
      suffixAbbreviation: ['', [
        Validators.required, Validators.maxLength(5), letterOnlyValidator()
      ]]
    });
  }

  returnToSuffixView(): void {
    this.backToEditSuffix.emit();
  }

  submit(){
    console.log('Submit button was click!');
  }

  openSuccessDialog(){
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Suffix Updated!',
        message: 'Suffix details has been updated successfully.'
      }
    })

    ref.afterClosed().subscribe({
      next: () => {
        this.returnToSuffixView();
      }
    })
  }

  get suffixNameControl(): AbstractControl {
    return this.suffixForm.get('suffixName')!;
  }
  
  get suffixAbbreviationControl(): AbstractControl {
    return this.suffixForm.get('suffixAbbreviation')!;
  }
}

import {Component, Output, EventEmitter, OnInit, Input} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { Suffix } from '../../../model/suffix.model';
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../../prompt/prompt-okay/prompt-okay.component";
import {SuffixService} from "../../../services/suffix.service";

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
  providers: [SuffixService],
  templateUrl: './edit-suffix.component.html',
  styleUrls: ['./edit-suffix.component.css', '../../program/add-program/add-program.component.css'],
})
export class EditSuffixComponent implements OnInit{
  suffixForm!: FormGroup;
  @Input() suffix!: Suffix;
  @Output() updatedSuffix = new EventEmitter<Suffix>();
  @Output() backToEditSuffix = new EventEmitter<void>();

  constructor(private formBuilder: FormBuilder,
    private dialog: MatDialog, private suffixService: SuffixService) {}

  ngOnInit() {
    this.initForm();
    this.setFormValues();
  }

  initForm(){
    this.suffixForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      abbreviation: ['', [Validators.required]]
    });
  }

  setFormValues(){
    this.suffixForm.patchValue({
      name: this.suffix.name,
      abbreviation: this.suffix.abbreviation,
    })
  }

  returnToSuffixView(): void {
    this.backToEditSuffix.emit();
  }

  submit(){
    const updatedSuffix = this.suffix;

    updatedSuffix.name = this.suffixForm.value.name;
    updatedSuffix.abbreviation = this.suffixForm.value.abbreviation;

    this.suffixService.updateSuffix(updatedSuffix).subscribe({
      next: value => {
        this.openSuccessDialog();
        this.updatedSuffix.emit(value);
      }
    })
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
}

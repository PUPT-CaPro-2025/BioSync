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
import {SuffixService} from "../../../services/suffix.service";
import {User} from "../../../model/user.model";

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
  providers: [SuffixService],
  templateUrl: './add-suffix.component.html',
  styleUrls: ['./add-suffix.component.css', '../../program/add-program/add-program.component.css']
})
export class AddSuffixComponent implements OnInit {
  suffixForm!: FormGroup;
  @Output() backToSuffix = new EventEmitter<void>();
  @Output() addedSuffix = new EventEmitter<Suffix>();

  constructor(private formBuilder: FormBuilder,
    private dialog: MatDialog, private suffixService: SuffixService) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.suffixForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      abbreviation: ['', [Validators.required]]
    });
  }

  returnToSuffixView(): void {
    this.backToSuffix.emit();
  }

  submit(){
    if(!this.suffixForm.valid) return;

    this.suffixService.createSuffix(this.suffixForm.value).subscribe({
      next: addedSuffix => {
        this.openDialog();
        this.addedSuffix.emit(addedSuffix);
      }
    })
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

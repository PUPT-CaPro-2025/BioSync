import { Component, Output, EventEmitter } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-add-subject',
  standalone: true,
  imports: [MatToolbarModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './add-subject.component.html',
  styleUrl: './add-subject.component.css'
})
export class AddSubjectComponent {
  @Output() backToSubject = new EventEmitter<void>();

  cancelOrAddSubject(): void {
    this.backToSubject.emit();
  }
}

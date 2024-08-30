import { Component, Input, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { AddLaboratoryComponent } from '../add-laboratory/add-laboratory.component';
import { EditLaboratoryComponent } from '../edit-laboratory/edit-laboratory.component';


interface laboratories {
  laboratory_name: string;
  room_code: string;
  capacity: string;
}

@Component({
  selector: 'app-laboratory',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
    CommonModule,
    AddLaboratoryComponent,
    EditLaboratoryComponent
  ],
  templateUrl: './laboratory.component.html',
  styleUrl: './laboratory.component.css'
})
export class LaboratoryComponent {
  isAddLaboratory: boolean = false;
  isEditLaboratory: boolean = false;

  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Alphabetical', 'Date'
  ];

  laboratory: laboratories[] = [
    { laboratory_name: "DOST Laboratory", room_code: "000", capacity: "40" },
    { laboratory_name: "Aboitiz Laboratory", room_code: "000", capacity: "40" },
    { laboratory_name: "New Laboratory", room_code: "000", capacity: "N/A" },
  ];

  get filteredLaboratories(): laboratories[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.laboratory.slice(startIndex, endIndex);
  }

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end}`;
  }

  onPageChange(): void {
    // Handle page change logic here
  }

  onItemsPerPageChange(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.onPageChange();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.onPageChange();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.onPageChange();
    }
  }

  toggleAddLaboratory(): void {
    this.isAddLaboratory = !this.isAddLaboratory;
  }

  handleBackToLaboratory(): void {
    this.isAddLaboratory = false;
  }

  toggleEditLaboratory(): void {
    this.isEditLaboratory = !this.isEditLaboratory;
  }

  handleBackToEditLaboratory(): void {
    this.isEditLaboratory = false;
  }
}
import { Component, Input, OnInit, HostListener} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Visitpurpose } from '../../model/visit.purpose.model';
import { MatDialog } from '@angular/material/dialog';
import {PromptConfirmComponent} from "../prompt/prompt-confirm/prompt-confirm.component";
import jsPDF from "jspdf";
import { AddVisitPurposeComponent } from './add-visit-purpose/add-visit-purpose.component';
import { EditVisitPurposeComponent } from './edit-visit-purpose/edit-visit-purpose.component';

@Component({
  selector: 'app-visit-purpose',
  standalone: true,
  imports: [ MatToolbarModule, 
    MatFormFieldModule,
    MatIconModule, 
    MatInputModule, 
    FormsModule, 
    ReactiveFormsModule, 
    MatButtonModule, 
    MatSelectModule, 
    CommonModule,
    AddVisitPurposeComponent,
    EditVisitPurposeComponent
  ],
  templateUrl: './visit-purpose.component.html',
  styleUrls: ['./visit-purpose.component.css', '../program/program.component.css']
})
export class VisitPurposeComponent implements OnInit {
  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Alphabetical', 'Date'
  ];

  visitPurposes: Visitpurpose[] = [
    {id: 1, visitPurpose: 'Organized Laboratory'},
    {id: 2, visitPurpose: 'Panelist'},
  ];

  totalItems: number = this.visitPurposes.length; //temporary value
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  isAddVisitPurpose: boolean = false;
  isEditVisitPurpose: boolean = false;
  visitPurposeToEdit!: Visitpurpose;
  currentVisitPurpose: number | undefined;
  headerImage!: string;
  activeDropdownId: number | null = null;

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    this.totalItems = this.visitPurposes.length; //temporary
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage); //temporary
    this.loadImageToBase64('../../assets/header.png', (base64Image) => {
      this.headerImage = base64Image;
    });
  }

  get filteredVisitPurposes(): Visitpurpose[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.visitPurposes.slice(startIndex, endIndex);
  }

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

  toggleDropdownAction(programId: number): void {
    this.activeDropdownId = this.activeDropdownId === programId ? null : programId;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const isDropdownClicked = target.closest('.action-container') !== null;
    const isToggleButtonClicked = target.closest('.dropdown-toggle') !== null;

    if (!isDropdownClicked && !isToggleButtonClicked) {
      this.activeDropdownId = null;
    }
  }

  toggleAddVisitPurpose(): void {
    this.isAddVisitPurpose = !this.isAddVisitPurpose;
  }

  handleBackToVisitPurpose(): void {
    this.isAddVisitPurpose = false;
  }

  toggleEdittVisitPurpose(visitPurpose: Visitpurpose): void {
    this.activeDropdownId = null;
    this.isEditVisitPurpose = !this.isEditVisitPurpose;
    this.visitPurposeToEdit = visitPurpose;
  }

  handleBackToEditVisitPurpose(): void {
    this.isEditVisitPurpose = false;
  }

  loadImageToBase64(url: string, callback: (base64Image: string) => void): void {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // To prevent CORS issues
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const base64Image = canvas.toDataURL('image/png');
      callback(base64Image);
    };
  }
}

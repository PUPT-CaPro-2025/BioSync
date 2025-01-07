import { Component, Input, OnInit, HostListener} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { VisitPurpose } from '../../model/visit.purpose.model';
import { MatDialog } from '@angular/material/dialog';
import { AddVisitPurposeComponent } from './add-visit-purpose/add-visit-purpose.component';
import { EditVisitPurposeComponent } from './edit-visit-purpose/edit-visit-purpose.component';
import {VisitPurposeService} from "../../services/visit.purpose.service";
import {Suffix} from "../../model/suffix.model";
import {PromptConfirmComponent} from "../prompt/prompt-confirm/prompt-confirm.component";
import {PromptOkayComponent} from "../prompt/prompt-okay/prompt-okay.component";

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
  providers: [VisitPurposeService],
  templateUrl: './visit-purpose.component.html',
  styleUrls: ['./visit-purpose.component.css', '../schedule/schedule.component.css']
})
export class VisitPurposeComponent implements OnInit {
  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Alphabetical', 'Date'
  ];

  visitPurposes: VisitPurpose[] = [];

  totalItems: number = this.visitPurposes.length; //temporary value
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  isAddVisitPurpose: boolean = false;
  isEditVisitPurpose: boolean = false;
  visitPurposeToEdit!: VisitPurpose;
  currentVisitPurpose: number | undefined;
  headerImage!: string;
  activeDropdownId: number | null = null;

  constructor(private dialog: MatDialog, private visitPurposeService: VisitPurposeService) {}

  ngOnInit() {
    this.getVisitPurposes();
  }

  getVisitPurposes(){
    this.visitPurposeService.getVisitPurposes().subscribe({
      next: (purposes: VisitPurpose[]) => {
        this.visitPurposes = purposes;
        this.totalItems = this.visitPurposes.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      }
    })
  }

  get filteredVisitPurposes(): VisitPurpose[] {
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

  toggleEdittVisitPurpose(visitPurpose: VisitPurpose): void {
    this.activeDropdownId = null;
    this.isEditVisitPurpose = !this.isEditVisitPurpose;
    this.visitPurposeToEdit = visitPurpose;
  }

  handleBackToEditVisitPurpose(): void {
    this.isEditVisitPurpose = false;
  }

  openDeleteDialog(purpose: VisitPurpose){
    const ref = this.dialog.open(PromptConfirmComponent, {
      width: '350px',
      data: {
        title: "Delete Suffix",
        message: "Are you sure you want to delete suffix?"
      }
    })

    ref.afterClosed().subscribe({
      next: result => {
        if (!result) return

        this.visitPurposeService.deletePurpose(purpose.id).subscribe({
          next: () => {
            this.visitPurposes = this.visitPurposes.filter(p => p.id !== purpose.id)
            this.updatePagination();
            this.openSuccessDialog();
          }
        })
      }
    })
  }

  openSuccessDialog(){
    this.dialog.open(PromptOkayComponent, {
      width: '350px',
      data: {
        title: "Purpose Deleted",
        message: "Visit Purpose has been deleted."
      }
    })
  }

  updatePagination(): void {
    this.totalItems = this.visitPurposes.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  onPurposeAdded(purpose: VisitPurpose){
    this.visitPurposes.push(purpose);
    this.updatePagination();
  }

  protected readonly open = open;
}

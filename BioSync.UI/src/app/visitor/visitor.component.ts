import { Visitor } from '../../model/visitor.model';
import {Component, Input, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditVisitorComponent } from '../edit-visitor/edit-visitor.component';
import {VisitorService} from "../../services/visitor.service";
import {MatDialog} from "@angular/material/dialog";
import {Schedule} from "../../model/schedule-model";
import {PromptConfirmComponent} from "../prompt-confirm/prompt-confirm.component";

@Component({
  selector: 'app-visitor',
  standalone: true,
  imports: [MatToolbarModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    EditVisitorComponent],
  providers: [VisitorService],
  templateUrl: './visitor.component.html',
  styleUrl: './visitor.component.css'
})
export class VisitorComponent implements OnInit{
  //Temporary Data
  visitors: Visitor[] = [];

  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Subject Code', 'Alphabetical', 'Date'
  ];

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  isEditVisitor: boolean = false;

  constructor(
    private visitorService: VisitorService,
    private dialog: MatDialog
  ){}

  ngOnInit() {
    this.initializeVisitors();
  }

  initializeVisitors(){
    this.visitorService.getVisitors().subscribe({
      next: (visitors: Visitor[]) => {
        this.visitors = visitors;
      }
    })
  }

  getDate(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${hours}:${minutes}:${seconds} ${ampm}`;
  }

  openDeleteDialog(visitor: Visitor): void {
    const dialogRef = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: 'Delete Visitor',
        message: 'Are you sure you want to delete this visitor?',
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!result) return;

      this.deleteVisitorLog(visitor);
    })
  }

  deleteVisitorLog(visitor: Visitor): void {
    this.visitorService.deleteVisitor(visitor).subscribe({
      next: () => {
        this.visitors = this.visitors.filter(v => v.id !== visitor.id);
      },
      error: err => console.error(err)
    })
  }

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end}`;
  }

  get filteredVisitors(): Visitor[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.visitors.slice(startIndex, endIndex);
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

  toggleEditVisitor(): void {
    this.isEditVisitor = !this.isEditVisitor;
  }

  handleBackToEditVisitor(): void {
    this.isEditVisitor = false;
  }

  protected readonly open = open;
}

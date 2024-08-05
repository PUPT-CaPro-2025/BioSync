import {Component, Input, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Schedule } from '../../model/schedule-model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddScheduleComponent } from '../add-schedule/add-schedule.component';
import { MatSelectModule } from '@angular/material/select';
import { EditScheduleComponent } from '../edit-schedule/edit-schedule.component';
import { ViewScheduleComponent } from '../view-schedule/view-schedule.component';
import {ScheduleService} from "./schedule.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, CommonModule, FormsModule, AddScheduleComponent, MatSelectModule, EditScheduleComponent, ViewScheduleComponent],
  providers: [ScheduleService],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css',
})

export class ScheduleComponent implements OnInit{
  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Subject Code', 'Alphabetical', 'Date'
  ];

  yearSemesters: string[] = [
    'School Year 2324 - First Semester', 'School Year 2324 - Second Semester', 'School Year 2324 - Summer'
  ];

  selectedYearSem = 'School Year 2324 - Summer';

  schedule: Schedule[] = [];

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  isAddSchedule: boolean = false;
  isEditSchedule: boolean = false;
  isViewSchedule: boolean = false;
  currentSchedule: number | undefined;

  constructor(
    private scheduleService: ScheduleService,
    ) {}

  ngOnInit() {
    this.getAllSubjects();
  }

  getAllSubjects() {
    this.scheduleService.getAllSchedules().subscribe({
      next: schedules => {
        schedules.forEach(schedule => this.schedule.push(schedule));
      },
      error: err => console.error(err)
    })
  }

  convertTimeFormat(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);

    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 hours to 12
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes} ${period}`;
  }

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end}`;
  }

  get filteredSchedules(): Schedule[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.schedule.slice(startIndex, endIndex);
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

  toggleAddSchedule(): void {
    this.isAddSchedule = !this.isAddSchedule;
  }

  handleBackToSchedule(): void {
    this.isAddSchedule = false;
  }

  toggleEditSchedule(): void {
    this.isEditSchedule = !this.isEditSchedule;
  }

  handleEditBackToSchedule(): void {
    this.isEditSchedule = false;
  }

  toggleViewSchedule(scheduleId: number | undefined): void {
    this.isViewSchedule = !this.isViewSchedule;

    if(this.isViewSchedule){
      this.currentSchedule = scheduleId;
    }
  }

  setViewId(){
    return this.currentSchedule;
  }

  handleViewBackToSchedule(): void {
    this.isViewSchedule = false;
  }
}

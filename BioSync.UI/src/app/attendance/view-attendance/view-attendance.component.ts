import { Component, OnInit } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { Schedule } from '../../../model/schedule.model';
import { ActivatedRoute } from '@angular/router';
import { ScheduleService } from '../../../services/schedule.service';
import { AttendanceService } from '../../../services/attendance.service';
import { Attendance } from '../../../model/attendance.model';
import jsPDF from 'jspdf';
import { MatIcon } from '@angular/material/icon';
import { CryptoService } from '../../../services/crypto.service';
import {CookieService} from '../../../services/cookie.service';

@Component({
  selector: 'app-view-attendance',
  standalone: true,
  imports: [MatToolbar, MatIcon],
  providers: [ScheduleService, AttendanceService],
  templateUrl: './view-attendance.component.html',
  styleUrls: [
    './view-attendance.component.css',
    '../../schedule/schedule.component.css',
  ],
})
export class ViewAttendanceComponent implements OnInit {
  schedule!: Schedule;
  class: Attendance[] = [];
  student!: Attendance;
  userId!: number;
  bagongPilipinas!: string;
  stamp!: string; 
  schoolLogo!: string;  
  headerImage!: string;
  reportDropdown = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private scheduleService: ScheduleService,
    private attendanceService: AttendanceService,
    private cryptoService: CryptoService,
    private cookieService: CookieService 
  ) {}

  ngOnInit() {
    this.getUserId();
    this.activatedRoute.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.getScheduleDetails(+id!);
      this.getAttendance(+id!);
    });
    this.loadImageToBase64('../../assets/BagongPilipinas.png', (base64Image) => {
      this.bagongPilipinas = base64Image;
    });

    this.loadImageToBase64('../../assets/stamp.jpg', (base64Image) => {
      this.stamp = base64Image;
    });

    this.loadImageToBase64('../../assets/PUPLogo.png', (base64Image) => {
      this.schoolLogo = base64Image;
    });
  }

  getUserId() {
    const encryptedUserId = decodeURIComponent(
      this.cookieService.getCookie('user_id')!,
    );
    this.userId = +this.cryptoService.decrypt(encryptedUserId);
  }

  getAttendance(scheduleId: number) {
    this.attendanceService.getAttendanceByScheduleId(scheduleId).subscribe({
      next: (value) => {
        this.class = value;

        if(this.getRole() === "STUDENT"){
          const studentAttendance = this.class.find(
            (attendance) => attendance.user.id === this.userId
          );

          if(studentAttendance){
            this.student = studentAttendance;
          }
        }
      },
    });
  }

  getTime(isoString: string){
    const date = new Date(isoString);

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  }

  getScheduleDetails(scheduleId: number) {
    this.scheduleService.getScheduleById(scheduleId).subscribe({
      next: (value) => {
        this.schedule = value;
      },
    });

    this.loadImageToBase64('../../assets/header.png', (base64Image) => {
      this.headerImage = base64Image;
    });
  }

  convertTo12HourFormat(string: string) {
    return this.scheduleService.convertTimeFormat(string);
  }

  returnToSchoolYearView() {
    history.back();
  }

  toggleDropdown() {
    this.reportDropdown = !this.reportDropdown;
  }

  generatePdf() {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const leftX = 10;
    const rightX = pageWidth - 10;
    const lineHeight = 7;
    let currentY = 60; // Start position for content

    //Header and Rows
    const columns = ['No.', 'Student Name', 'Time-In', 'Time-Out', 'Status'];
    const rows = this.class.map((attendance, index) => [
      `${index + 1}`,
      `${attendance.user.firstName} ${attendance.user.lastName}`,
      attendance.timeIn ? this.getTime(attendance.timeIn) : 'N/A',
      attendance.timeOut ? this.getTime(attendance.timeOut) : 'N/A',
      attendance.status,
    ]);

    // Calculate present and absent counts
    const presentCount = this.class.filter(
      (attendance) => attendance.status.toLowerCase() === 'present',
    ).length;
    const absentCount = this.class.filter(
      (attendance) => attendance.status.toLowerCase() === 'absent',
    ).length;

    // Function to render header (will be called on each page)
    const renderHeader = (currentPage: number, pageCount: number) => {
       //Add header image
       const margin = 10;
       const imgWidth = 20; 
       const imgHeight = 20;
 
       doc.addImage(this.schoolLogo, 'PNG', margin, 10, imgWidth, imgHeight);
 
       const textStartX = margin + imgWidth + 5;
       const textStartY = 15;
       doc.setFontSize(10);
       doc.text('Republic of the Philippines', textStartX, textStartY);
 
       doc.setFontSize(12);
       doc.setFont('times', 'bold');
       doc.text('POLYTECHNIC UNIVERSITY OF THE PHILIPPINES', textStartX, textStartY + 5);
 
       doc.setFontSize(10);
       doc.setFont('times', 'normal');
       doc.text('Office of the Vice President for Branches and Campuses', textStartX, textStartY + 10);
 
       doc.setFontSize(11);
       doc.setFont('times', 'bold');
       doc.text('TAGUIG CAMPUS', textStartX, textStartY + 15);
 
       doc.addImage(this.bagongPilipinas, 'PNG', pageWidth - margin - imgWidth, 10, imgWidth, imgHeight);
 
        // Add Title
       doc.setFontSize(20);
       doc.setFont('helvetica', 'bold');
       doc.text('ATTENDANCE', pageWidth / 2, 30, { align: 'center' });

       let currentY = 40;

       doc.setFontSize(10);
       doc.setFont('helvetica', 'bold');
       doc.text('Course:', leftX, currentY);
       doc.setFont('helvetica', 'normal');
       doc.text(this.schedule.subject?.description || '', leftX + 40, currentY);

       doc.setFont('helvetica', 'bold');
       doc.text('Date:', rightX - 40, currentY, { align: 'right' });
       doc.setFont('helvetica', 'normal');
       doc.text(this.schedule.scheduleDate || '', rightX, currentY, {
         align: 'right',
       });
       currentY += lineHeight;

       doc.setFont('helvetica', 'bold');
       doc.text('Faculty:', leftX, currentY);
       doc.setFont('helvetica', 'normal');
       doc.text(
         `${this.schedule.professor?.firstName} ${this.schedule.professor?.lastName}` || '',
         leftX + 40,
         currentY,
       );

       doc.setFont('helvetica', 'bold');
       doc.text('Start/End Time:', rightX - 40, currentY, { align: 'right' });
       doc.setFont('helvetica', 'normal');
       doc.text(
         `${this.convertTo12HourFormat(this.schedule.startTime)} - ${this.convertTo12HourFormat(this.schedule.endTime)}` || '',
         rightX,
         currentY,
         {
           align: 'right',
         },
       );
       currentY += lineHeight;

       doc.setFont('helvetica', 'bold');
       doc.text('Program & Year:', leftX, currentY);
       doc.setFont('helvetica', 'normal');
       doc.text(
         `${this.schedule.section?.program?.programAbbreviation || ''} ${
           this.schedule.section?.section || ''
         }`,
         leftX + 40,
         currentY,
       );

       doc.setFont('helvetica', 'bold');
       doc.text('Date/Time Printed:', rightX - 40, currentY, { align: 'right' });
       doc.setFont('helvetica', 'normal');
       const currentDate = new Date().toLocaleString();
       doc.text(currentDate, rightX, currentY, { align: 'right' });

       currentY += lineHeight;

       doc.setFont('helvetica', 'bold');
       doc.text('Present:', leftX, currentY);
       doc.setFont('helvetica', 'normal');
       doc.text(`${presentCount}`, leftX + 40, currentY);

       doc.setFont('helvetica', 'bold');
       doc.text('Absent:', rightX - 55, currentY);
       doc.setFont('helvetica', 'normal');
       doc.text(`${absentCount}`, rightX, currentY, { align: 'right' });

       // Add page counter at the bottom
       doc.setFontSize(10);
       doc.setFont('helvetica', 'normal');
       doc.text(`Page ${currentPage} of ${pageCount}`, pageWidth / 2, 200, {
         align: 'center',
       });
 
         // Add footer
       const footerY = doc.internal.pageSize.height - 15;
       const textLeftX = 10;  
 
       doc.setFont('helvetica', 'normal');
       doc.setFontSize(8);
       doc.text('General Santos Ave., Lower Bicutan, Taguig City, Philippines 1632', textLeftX, footerY - 10);
       doc.text('Direct Line: (02) 8837 5858 to 60', textLeftX, footerY - 5);
 
       doc.setTextColor(0, 0, 0); 
       doc.text('Website: ', textLeftX, footerY + 0.5);
       doc.setTextColor(0, 0, 255); 
       doc.textWithLink('www.pup.edu.ph', textLeftX + 12, footerY + 0.5, { url: 'http://www.pup.edu.ph' });
       doc.setTextColor(0, 0, 0);
       doc.text(' | Email: ', textLeftX + 33, footerY + 0.5);
       doc.text('taguig@pup.edu.ph', textLeftX + 44, footerY + 0.5);
       doc.setTextColor(0);
 
       doc.setFont('times', 'normal');
       doc.setFontSize(15);
       doc.text('THE COUNTRY\'S 1st POLYTECHNICU', textLeftX, footerY + 8);
 
       const stampRightX = doc.internal.pageSize.width - 80;
       const stampWidth = 65;
       const stampHeight = 30; 
       doc.addImage(this.stamp, 'JPEG', stampRightX, footerY - 15, stampWidth, stampHeight);
    };

    // Render table
    const tableWidth = columns.length * 40; // Adjust column width here if needed
    const tableMarginLeft = (pageWidth - tableWidth) / 2;

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 75,
      theme: 'grid',
      styles: {
        fontSize: 10,
        halign: 'center',
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineWidth: 0.4,
        lineColor: [0, 0, 0],
      },
      bodyStyles: {
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: 15 }, // No.
        1: { cellWidth: 80, halign: 'left' }, // Student Name
        2: { cellWidth: 40 }, // Time-In
        3: { cellWidth: 40 }, // Time-Out
        4: { cellWidth: 30 }, // Status
      },
      margin: { left: tableMarginLeft, top: 80, bottom: 40 },
      didDrawPage: (data: { pageNumber: number; pageCount: number }) => {
        renderHeader(data.pageNumber, data.pageCount);
      },
    });

    // Save the PDF
    doc.save(
      `attendance-${this.schedule.subject?.code}-${
        this.schedule.scheduleDate
      }.pdf`,
    );
  }

  generateCSV() {
    const headers = [
      'Student Name',
      'Time In',
      'Time Out',
      'Status',
    ];

    const rows = this.class.map((attendance) => [
      `${attendance.user.firstName} ${attendance.user.lastName}`,
        attendance.timeIn ? this.getTime(attendance.timeIn) : 'N/A',
        attendance.timeOut ? this.getTime(attendance.timeOut) : 'N/A',
        attendance.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((value) => `"${value}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance-${this.schedule.subject?.code}-${this.schedule.scheduleDate}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  loadImageToBase64(
    url: string,
    callback: (base64Image: string) => void,
  ): void {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
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

  getRole(): string {
    const encryptedRole = <string>decodeURIComponent(this.cookieService.getCookie("role")!);
    return this.cryptoService.decrypt(encryptedRole);
  }
}

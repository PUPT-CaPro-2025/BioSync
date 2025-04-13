import {Component, OnInit} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatToolbar} from "@angular/material/toolbar";
import {Schedule} from "../../../model/schedule.model";
import {ScheduleService} from "../../../services/schedule.service";
import {ActivatedRoute, Router} from "@angular/router";
import jsPDF from "jspdf";
import {CryptoService} from "../../../services/crypto.service";
import {CookieService} from "../../../services/cookie.service";
import {AttendanceService} from "../../../services/attendance.service";
import {Attendance} from "../../../model/attendance.model";
import {forkJoin} from "rxjs";

@Component({
  selector: 'app-attendance-list',
  standalone: true,
    imports: [
        MatIcon,
        MatToolbar
    ],
    providers: [ScheduleService, AttendanceService],
  templateUrl: './attendance-list.component.html',
  styleUrl: './attendance-list.component.css'
})
export class AttendanceListComponent implements OnInit{
    schedules: Schedule[] = [];
    schedule!: Schedule;
    recurrenceId: string | null | undefined;
    today: number;
    headerImage!: string;
    bagongPilipinas!: string;
    stamp!: string;
    schoolLogo!: string;
    reportDropdown = false;
    class: Attendance[] = [];

    constructor(
        private scheduleService: ScheduleService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private cryptoService: CryptoService,
        private cookieService: CookieService,
        private attendanceService: AttendanceService,
    ) {
        this.today = new Date().setHours(0, 0, 0, 0);
    }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe(params => {
            this.recurrenceId = params.get('id');
            if(this.recurrenceId)
                this.getSchedulesByRecurrenceId(this.recurrenceId!);
        });

        this.loadImageToBase64('../../assets/header.png', (base64Image) => {
            this.headerImage = base64Image;
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

    getSchedulesByRecurrenceId(recurrenceId: string) {
        this.scheduleService.getSchedulesByRecurrenceId(recurrenceId).subscribe({
            next: (schedules: Schedule[]) => {
                const finishedSchedules = schedules.filter(schedule =>
                    schedule.hasFinished
                );

                finishedSchedules.sort((a, b) => new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime());

                this.schedules = [...finishedSchedules];

                this.schedule = schedules[0];

                this.schedules.forEach(schedule => {
                    this.getAttendance(schedule.id)
                })
            }
        });
    }

    getDayOfWeek(date: string | Date) {
        return this.scheduleService.getDayOfWeek(date);
    }

    convertTimeFormat(time: string) {
        return this.scheduleService.convertTimeFormat(time);
    }

    toggleStartSchedule(schedule: Schedule) {
        this.router.navigate(['/view/attendance', schedule.id]).then();
    }

    toggleDropdown() {
        this.reportDropdown = !this.reportDropdown;
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

    convertTo12HourFormat(string: string) {
        return this.scheduleService.convertTimeFormat(string);
    }

    getRole(): string {
        const encryptedRole = <string>decodeURIComponent(this.cookieService.getCookie("role")!);
        return this.cryptoService.decrypt(encryptedRole);
    }

    formatTime(timestamp: string | null): string {
        if (!timestamp) return '-'; // Handle null or undefined timestamps
        const date = new Date(timestamp);

        // Convert to 12-hour format
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0'); // Add leading zero
        const ampm = hours >= 12 ? 'PM' : 'AM'; // Determine AM/PM

        hours = hours % 12 || 12; // Convert to 12-hour format (0 becomes 12)

        return `${hours}:${minutes} ${ampm}`;
    }


    getAttendance(scheduleId: number) {
        this.attendanceService.getAttendanceByScheduleId(scheduleId).subscribe();
    }

    populateRows(printType: string) {
        const uniqueDates = [...new Set(this.schedules.map(schedule => schedule.scheduleDate))];

        // Prepare an array of observables for fetching attendance data for each schedule
        const attendanceObservables = this.schedules.map(schedule =>
            this.attendanceService.getAttendanceByScheduleId(schedule.id)
        );

        // Fetch all attendance data simultaneously
        forkJoin(attendanceObservables).subscribe({
            next: (attendanceDataArray) => {
                // Combine all attendance data into a single array
                const allAttendance = attendanceDataArray.flat();

                // Group attendance by student
                const attendanceByStudent = new Map();


                allAttendance.forEach(record => {
                    const userFullName = `${record.user.lastName}, ${record.user.firstName}`.toUpperCase();

                    if (!attendanceByStudent.has(userFullName)) {
                        // Initialize an empty array for the student
                        attendanceByStudent.set(userFullName, {});
                    }

                    // Map attendance for the specific date
                    attendanceByStudent.get(userFullName)[record.schedule.scheduleDate] = {
                        timeIn: this.formatTime(record.timeIn)  || '-',
                        timeOut: this.formatTime(record.timeOut) || '-',
                        status: record.status
                    };
                });

                // Build rows
                const rows = Array.from(attendanceByStudent.entries()).map(([name, dates], index) => {
                    const row = [index + 1, name];

                    let absentCount = 0;
                    let lateCount = 0;

                    uniqueDates.forEach(date => {
                        if (dates[date]) {
                            const timeIn = dates[date].timeIn;
                            const timeOut = dates[date].timeOut;

                            if (timeIn !== '-' && timeOut !== '-') {
                                if(dates[date].status === 'LATE'){
                                    lateCount++;
                                }
                            } else {
                                absentCount++;
                            }

                            row.push(`${timeIn} - ${timeOut}`);
                        } else {
                            row.push('-');
                            absentCount++;
                        }
                    });

                    row.push(lateCount);
                    row.push(absentCount);

                    return row;
                });

                if(printType === "pdf"){
                    this.generatePdf(rows, uniqueDates);
                } else {
                    this.generateCsv(rows, uniqueDates);
                }
            },
            error: (error) => {
                console.error('Error fetching attendance:', error);
            },
        });
    }

    generatePdf(rows: any[], uniqueDates: string[]) {
        const doc = new jsPDF('landscape', 'mm', [215.9, 330.2]);
        const pageWidth = doc.internal.pageSize.getWidth();
        const leftX = 10;
        const rightX = pageWidth - 10;
        const lineHeight = 7;
        let currentY = 60; // Start position for content

        // Headers
        const headerRow1 = ['No.', 'Date', ...uniqueDates, " ", " "];
        const headerRow2 = [' ', 'Name', ...uniqueDates.flatMap(() => ['Time' +
        ' In' +
        ' - Time Out']), 'Late', "Absent"];

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

            //Title
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('ATTENDANCE', pageWidth / 2, 45, { align: 'center' });

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
                    this.schedule.section?.year || ''
                }`,
                leftX + 40,
                currentY,
            );

            doc.setFont('helvetica', 'bold');
            doc.text('Date/Time Printed:', rightX - 40, currentY, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            const currentDate = new Date().toLocaleString();
            doc.text(currentDate, rightX, currentY, { align: 'right' });

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

        doc.autoTable({
            head: [headerRow1, headerRow2],
            body: rows,
            startY: 60,
            theme: 'grid',
            styles: {
                fontSize: 9,
                halign: 'center',
                cellWidth: 'wrap',
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
                0: { cellWidth: 'auto' },
                [headerRow2.length - 1]: { cellWidth: 'auto' },
            },
            margin: { top: 60, bottom: 30 },
            didDrawPage: (data: { pageNumber: number; pageCount: number }) => {
                // Render the header
                renderHeader(data.pageNumber, doc.getNumberOfPages());

                const currentPage = data.pageNumber;
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(
                    `Page ${currentPage}`,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            },
        });

        // Save the PDF
        doc.save(
            `attendance-${this.schedule.subject?.code}-${
                this.schedule.scheduleDate
            }.pdf`,
        );
    }

    generateCsv(rows: any[], uniqueDates: string[]) {
        const csvRows: string[] = [];

        // Add header rows (headerRow1 and headerRow2)
        const headerRow1 = ['No.', 'Date', ...uniqueDates, ' ', ' '];
        const headerRow2 = [
            ' ',
            'Name',
            ...uniqueDates.flatMap(() => ['Time In - Time Out']),
            'Present',
            'Absent',
        ];

        // Add header rows to CSV
        csvRows.push(headerRow1.join(',')); // Convert array to comma-separated string
        csvRows.push(headerRow2.join(','));

        // Add data rows
        rows.forEach(row => {
            csvRows.push(row.join(',')); // Convert each row to comma-separated string
        });

        // Create CSV content
        const csvContent = csvRows.join('\n'); // Join rows with newline characters

        // Create a Blob and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `attendance-${this.schedule.subject?.code}-${this.schedule.scheduleDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }



}

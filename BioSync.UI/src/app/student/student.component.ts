import { Component } from '@angular/core';
import { Student } from '../../model/student-model';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [],
  templateUrl: './student.component.html',
  styleUrl: './student.component.css'
})
export class StudentComponent {
  //Temporary data
  students: Student[] = [
    { id: 1, student_number: "2021-00123-TG-0", first_name: "John", last_name: "Doe", middle_initial: "B", suffix: "N/A", program: "BSIT", year: 3, section: 1 },
    { id: 2, student_number: "2021-00456-TG-0", first_name: "Jane", last_name: "Doowie", middle_initial: "S", suffix: "Jr", program: "DIT", year: 1, section: 1 },
    { id: 3, student_number: "2021-00789-TG-0", first_name: "Sarah", last_name: "Kirkkoff", middle_initial: "M", suffix: "N/A", program: "BSOA", year: 2, section: 1 },
    { id: 4, student_number: "2021-00321-TG-0", first_name: "Steve", last_name: "Montemayor", middle_initial: "T", suffix: "N/A", program: "BSIT", year: 4, section: 1 },
    { id: 5, student_number: "2021-00654-TG-0", first_name: "Reymark", last_name: "Astrono", middle_initial: "N/A", suffix: "2nd", program: "BSOA", year: 4, section: 1 },
    { id: 6, student_number: "2021-00987-TG-0", first_name: "Maribelle", last_name: "Hernandez", middle_initial: "F", suffix: "N/A", program: "DIT", year: 2, section: 1 },
  ]
}

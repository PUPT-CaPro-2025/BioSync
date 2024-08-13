export interface Student {
    id: number
    student_number: string;
    first_name: string;
    last_name: string;
    middle_initial?: string;
    suffix?: string;
    program: string;
    year: number;
    section: number;
  }
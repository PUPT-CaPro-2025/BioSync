import {Subject} from "./subject-model";

export interface Schedule {
    section: string;
    startTime: string;
    endTime: string;
    scheduleDate: string;
    labRoom: string;
    professor: string;
    semester: string;
    schoolYear: string;
    remarks: string;
    subject: Subject;
  }

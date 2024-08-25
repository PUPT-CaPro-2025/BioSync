import {Subject} from "./subject-model";
import {User} from "./user.model";
import {SchoolYear} from "./school.year.model";
import {Semester} from "./semester.model";
import {Laboratory} from "./laboratory.model";
import {Section} from "./section.model";

export interface Schedule {
    id: number
    section?: Section;
    startTime: string;
    endTime: string;
    scheduleDate: string;
    laboratory?: Laboratory;
    professor?: User;
    semester?: Semester;
    schoolYear?: SchoolYear;
    remarks: string;
    subject?: Subject;
  }

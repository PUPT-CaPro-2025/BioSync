import {Subject} from "./subject-model";
import {User} from "./user.model";

export interface Schedule {
    id: number
    section: string;
    startTime: string;
    endTime: string;
    scheduleDate: string;
    labRoom: string;
    professor?: User;
    semester: string;
    schoolYear: string;
    remarks: string;
    subject?: Subject;
  }

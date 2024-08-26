import {Semester} from "./semester.model";

export interface SchoolYear {
  id: number;
  startYear: Date;
  endYear: Date;
  firstSemester: Semester;
  secondSemester: Semester;
  summerSemester: Semester;
}

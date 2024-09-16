import {User} from "./user.model";

export interface Attendance {
  id: number;
  message: string;
  student: User;
}

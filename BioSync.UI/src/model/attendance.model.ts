import {Schedule} from "./schedule.model";
import {User} from "./user.model";

export interface Attendance {
  id: number;
  schedule: Schedule;
  time_in: string;
  time_out: string;
  status: string;
  user: User;
}

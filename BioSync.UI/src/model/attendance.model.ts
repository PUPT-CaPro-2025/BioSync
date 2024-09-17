import {Schedule} from "./schedule.model";
import {User} from "./user.model";

export interface Attendance {
  id: number;
  schedule: Schedule;
  timestamp: string;
  status: string;
  user: User;
}

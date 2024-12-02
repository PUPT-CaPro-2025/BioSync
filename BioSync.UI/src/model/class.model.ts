import { Schedule } from './schedule.model';
import { User } from './user.model';

export interface ClassResponse {
  id: number;
  schedule: Schedule;
  student: User;
  hasLogged: boolean;
  computerNumber: number;
}

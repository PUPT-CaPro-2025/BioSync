import {User} from "./user.model";

export interface Timein {
  id: number;
  message: string;
  student: User;
}

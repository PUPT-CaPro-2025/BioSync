import {Program} from "./program.model";

export interface User {
  id: number
  firstName: string;
  lastName: string;
  middleName: string;
  usercode: string;
  suffix: string;
  role: string;
  password?: string;
  program?: Program;
  year?: string;
  section?: string
}

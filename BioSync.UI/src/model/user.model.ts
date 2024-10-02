import {Program} from "./program.model";
import {Section} from "./section.model";

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
  section?: Section;
  email: string;
}

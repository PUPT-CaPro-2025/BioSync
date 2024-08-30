import {Program} from "./program.model";

export interface Section {
  id: number
  year: string,
  section: string,
  program: Program,
}

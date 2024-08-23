export interface User {
  id: number
  firstName: string;
  lastName: string;
  middleName: string;
  usercode: string;
  suffix: string;
  role: string;
  password?: string;
}

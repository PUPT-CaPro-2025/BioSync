import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environment/app.setting';
import { CookieService } from './cookie.service';
import { User } from '../model/user.model';
import { Observable } from 'rxjs';
import { CsvResponse } from '../model/csvResponse.model';
import { ClassResponse } from '../model/class.model';

@Injectable()
export class UserService {
  url = `${environment.apiUrl}/api/v1`;
  token = this.cookieService.getCookie('authToken');
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {}

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.url}/auth/register`, user, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  createBulkUserOrSchedule(formData: FormData) {
    return this.http.post<CsvResponse>(`${this.url}/users/students`, formData, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  processProfileImage(formData: FormData) {
    return this.http.post<User>(`${this.url}/users/profile-image`, formData, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.url}/users/edit-user`, user, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.url}/users/role/${role}`, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  getUsersBySectionId(sectionId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.url}/users/section/${sectionId}`, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  getUsersByScheduleId(scheduleId: number): Observable<ClassResponse[]> {
    return this.http.get<ClassResponse[]>(
      `${this.url}/schedules/students/details/${scheduleId}`,
      {
        headers: this.headers,
        withCredentials: true,
      },
    );
  }

  addUserToSchedule(scheduleId: number, studentId: number): Observable<User> {
    const body = new FormData();
    body.set('schedule_id', scheduleId.toString());
    body.set('student_id', studentId.toString());

    return this.http.post<User>(`${this.url}/schedules/student/add`, body, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  removeUserToSchedule(scheduleId: number, studentId: number) {
    const body = new FormData();
    body.set('schedule_id', scheduleId.toString());
    body.set('student_id', studentId.toString());

    return this.http.post<User>(`${this.url}/schedules/student/remove`, body, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  getAllStudentsFilteredByScheduleId(scheduleId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.url}/users/students/${scheduleId}`, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  getUserById(userId: number) {
    return this.http.get<User>(`${this.url}/users/${userId}`, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  deleteUser(user: User) {
    return this.http.delete<User>(`${this.url}/users`, {
      body: { id: user.id },
      headers: this.headers,
      withCredentials: true,
    });
  }

  generatePassword(length: number = 8): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const specialCharacters = '!@#$%^&*()_+[]{}|;:,.<>?';

    const allCharacters = characters + specialCharacters;
    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * allCharacters.length);
      password += allCharacters[randomIndex];
    }

    return password;
  }
}

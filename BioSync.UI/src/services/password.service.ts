import { Injectable } from '@angular/core';
import { environment } from '../../environment/app.setting';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class PasswordService {
  url = `${environment.apiUrl}/api/v1/password`;

  constructor(private http: HttpClient) {}

  forgotPassword(email: string) {
    return this.http.post(
      `${this.url}/forgot?email=${email}`,
      {},
      {
        withCredentials: true,
        responseType: 'text' as 'json',
      },
    );
  }

  resetPassword(token: string, password: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new URLSearchParams();
    body.set('token', token);
    body.set('newPassword', password);

    return this.http.post(`${this.url}/reset`, body.toString(), {
      headers: headers,
      withCredentials: true,
      responseType: 'text' as 'json',
    });
  }
}

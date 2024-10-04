import { Injectable } from '@angular/core';
import {environment} from "../../environment/app.setting";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class PasswordService {
  url = `${environment.apiUrl}/api/v1/password`;

  constructor(private http: HttpClient) { }

  forgotPassword(email: string) {
    return this.http.post(`${this.url}/forgot?email=${email}`, {}, {
      withCredentials: true,
      responseType: 'text' as 'json',
    })
  }
}

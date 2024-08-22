import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../../environment/appsetting";
import {CookieService} from "../cookie.service";

@Injectable()
export class LogoutService {

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) { }

  logout() {
    const url = `${environment.apiUrl}/api/v1/auth/logout`;
    const token = this.cookieService.getCookie("authToken");
    const header = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(url, {}, {
      headers: header,
      withCredentials: true
    });
  }
}

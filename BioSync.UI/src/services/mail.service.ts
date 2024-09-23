import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Mail} from "../model/mail.model";
import {environment} from "../../environment/app.setting";
import {CookieService} from "./cookie.service";

@Injectable({
  providedIn: 'root'
})
export class MailService {
  url = `${environment.apiUrl}/api/v1/mail/send`;
  accessToken = this.cookieService.getCookie("authToken");
  headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  sendMail(mail: Mail){
    return this.http.post<Mail>(this.url, mail, {
      headers: this.headers,
      withCredentials: true,
      responseType: 'text' as 'json'
    })
  }
}
